import crypto from 'node:crypto'
import { prisma } from './prisma'
import { SITE_NAME, SITE_URL } from './constants'
import { getSiteSeoSettings, type ReportFrequency, type SiteSeoSettings } from './seo'

export interface ReportPeriod {
  frequency: ReportFrequency
  days: number
  label: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  startDateObj: Date
  endDateObj: Date
}

export interface AnalyticsIntegrationReadiness {
  gaMeasurementIdConfigured: boolean
  gtmIdConfigured: boolean
  gaPropertyIdConfigured: boolean
  gaServiceAccountConfigured: boolean
  emailProviderConfigured: boolean
  cronSecretConfigured: boolean
  recipientEmailConfigured: boolean
  readyForLiveGa4: boolean
  readyForAutoEmail: boolean
}

export interface Ga4SummaryMetrics {
  activeUsers: number
  newUsers: number
  sessions: number
  screenPageViews: number
  engagementRate: number // 0..100 (%)
  averageSessionDurationSec: number
  bounceRate: number // 0..100 (%)
}

export interface Ga4TopPageRow {
  path: string
  title: string
  views: number
  users: number
}

export interface Ga4ChannelRow {
  channel: string
  sessions: number
  users: number
}

export interface Ga4PortalEvents {
  whatsappClicks: number
  adBannerClicks: number
  utilityCallClicks: number
  newsTipsSubmitted: number
}

export interface PortalDbMetrics {
  publishedPostsTotal: number
  postsPublishedInPeriod: number
  totalRecordedViews: number
  leadsReceivedInPeriod: number
  activeJobsTotal: number
  upcomingEventsTotal: number
  topArticles: Array<{
    title: string
    slug: string
    views: number
    categoryName: string
    publishedAt: string
  }>
}

export interface AnalyticsReportPayload {
  generatedAt: string
  portalName: string
  portalUrl: string
  recipientEmail: string
  period: Omit<ReportPeriod, 'startDateObj' | 'endDateObj'>
  readiness: AnalyticsIntegrationReadiness
  ga4: {
    source: 'ga4_data_api' | 'pending_configuration' | 'api_error'
    statusMessage: string
    summary: Ga4SummaryMetrics
    topPages: Ga4TopPageRow[]
    trafficSources: Ga4ChannelRow[]
    portalEvents: Ga4PortalEvents
  }
  portalDb: PortalDbMetrics
}

export interface EmailDispatchResult {
  sent: boolean
  provider: 'resend' | 'webhook' | 'none'
  messageId?: string
  reason?: string
}

interface ServiceAccountCreds {
  clientEmail: string
  privateKey: string
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDateIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatDateBr(d: Date): string {
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function resolveServiceAccountCredentials(): ServiceAccountCreds | null {
  const jsonRaw = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim()
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw) as { client_email?: string; private_key?: string }
      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email.trim(),
          privateKey: parsed.private_key.replace(/\\n/g, '\n'),
        }
      }
    } catch {
      return null
    }
  }

  const email = process.env.GA4_SERVICE_ACCOUNT_EMAIL?.trim()
  const key = process.env.GA4_PRIVATE_KEY?.trim()
  if (email && key) {
    return {
      clientEmail: email,
      privateKey: key.replace(/\\n/g, '\n'),
    }
  }

  return null
}

export function getReportPeriod(
  frequency: ReportFrequency,
  referenceDate: Date = new Date()
): ReportPeriod {
  const days = frequency === 'biweekly' ? 15 : 30

  const end = new Date(referenceDate)
  end.setUTCHours(23, 59, 59, 999)
  end.setUTCDate(end.getUTCDate() - 1)

  const start = new Date(end)
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() - (days - 1))

  const prefix = frequency === 'biweekly' ? 'Quinzenal (15 dias)' : 'Mensal (30 dias)'
  const label = `${prefix} — ${formatDateBr(start)} a ${formatDateBr(end)}`

  return {
    frequency,
    days,
    label,
    startDate: formatDateIso(start),
    endDate: formatDateIso(end),
    startDateObj: start,
    endDateObj: end,
  }
}

export function isReportDue(
  frequency: ReportFrequency,
  lastSentAtIso?: string,
  now: Date = new Date()
): { due: boolean; reason: string } {
  if (!lastSentAtIso) {
    return { due: true, reason: 'Primeiro envio automático pendente.' }
  }

  const last = new Date(lastSentAtIso)
  if (Number.isNaN(last.getTime())) {
    return { due: true, reason: 'Data do último envio inválida; novo envio liberado.' }
  }

  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)

  if (frequency === 'biweekly') {
    if (diffDays >= 14) {
      return { due: true, reason: `Ciclo quinzenal atingido (${Math.floor(diffDays)} dias desde o último envio).` }
    }
    return {
      due: false,
      reason: `Último envio quinzenal há ${Math.floor(diffDays)} dia(s). Próximo envio após 14 dias.`,
    }
  }

  const lastMonthKey = `${last.getUTCFullYear()}-${String(last.getUTCMonth() + 1).padStart(2, '0')}`
  const nowMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`

  if (lastMonthKey !== nowMonthKey || diffDays >= 28) {
    return { due: true, reason: 'Novo ciclo mensal atingido.' }
  }

  return {
    due: false,
    reason: `Relatório mensal já enviado em ${formatDateBr(last)}.`,
  }
}

export function getAnalyticsIntegrationReadiness(
  settings: SiteSeoSettings
): AnalyticsIntegrationReadiness {
  const gaMeasurementIdConfigured = Boolean(settings.gaMeasurementId)
  const gtmIdConfigured = Boolean(settings.gtmId)
  const gaPropertyIdConfigured = /^\d+$/.test(settings.gaPropertyId)
  const gaServiceAccountConfigured = resolveServiceAccountCredentials() !== null
  const emailProviderConfigured = Boolean(
    process.env.RESEND_API_KEY?.trim() || process.env.ANALYTICS_EMAIL_WEBHOOK_URL?.trim()
  )
  const cronSecretConfigured = Boolean(process.env.ANALYTICS_CRON_SECRET?.trim())
  const recipientEmailConfigured = Boolean(settings.reportRecipientEmail)

  return {
    gaMeasurementIdConfigured,
    gtmIdConfigured,
    gaPropertyIdConfigured,
    gaServiceAccountConfigured,
    emailProviderConfigured,
    cronSecretConfigured,
    recipientEmailConfigured,
    readyForLiveGa4: gaPropertyIdConfigured && gaServiceAccountConfigured,
    readyForAutoEmail: emailProviderConfigured && recipientEmailConfigured,
  }
}

async function fetchGoogleOAuthAccessToken(creds: ServiceAccountCreds): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: creds.clientEmail,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: nowSec + 3600,
      iat: nowSec,
    })
  )

  const unsignedJwt = `${header}.${payload}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsignedJwt)
  signer.end()
  const signature = base64UrlEncode(signer.sign(creds.privateKey))
  const assertion = `${unsignedJwt}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OAuth token error (${res.status}): ${errText.slice(0, 200)}`)
  }

  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error('Google OAuth token response missing access_token')
  }

  return data.access_token
}

function emptyGa4Data(
  source: 'pending_configuration' | 'api_error',
  statusMessage: string
): AnalyticsReportPayload['ga4'] {
  return {
    source,
    statusMessage,
    summary: {
      activeUsers: 0,
      newUsers: 0,
      sessions: 0,
      screenPageViews: 0,
      engagementRate: 0,
      averageSessionDurationSec: 0,
      bounceRate: 0,
    },
    topPages: [],
    trafficSources: [],
    portalEvents: {
      whatsappClicks: 0,
      adBannerClicks: 0,
      utilityCallClicks: 0,
      newsTipsSubmitted: 0,
    },
  }
}

interface Ga4RunReportRow {
  dimensionValues?: Array<{ value?: string }>
  metricValues?: Array<{ value?: string }>
}

interface Ga4BatchReportResponse {
  reports?: Array<{ rows?: Ga4RunReportRow[] }>
}

async function fetchGa4DataApiMetrics(
  propertyId: string,
  period: ReportPeriod
): Promise<AnalyticsReportPayload['ga4']> {
  const cleanProp = propertyId.trim()
  const creds = resolveServiceAccountCredentials()

  if (!cleanProp || !/^\d+$/.test(cleanProp)) {
    return emptyGa4Data(
      'pending_configuration',
      'GA4_PROPERTY_ID numérico ainda não configurado (ex: 123456789).'
    )
  }

  if (!creds) {
    return emptyGa4Data(
      'pending_configuration',
      'Credenciais da Service Account do Google Analytics (GA4_SERVICE_ACCOUNT_EMAIL + GA4_PRIVATE_KEY ou GA4_SERVICE_ACCOUNT_JSON) ainda não configuradas no ambiente.'
    )
  }

  try {
    const token = await fetchGoogleOAuthAccessToken(creds)
    const dateRanges = [{ startDate: period.startDate, endDate: period.endDate }]

    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${cleanProp}:batchRunReports`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              dateRanges,
              metrics: [
                { name: 'activeUsers' },
                { name: 'newUsers' },
                { name: 'sessions' },
                { name: 'screenPageViews' },
                { name: 'engagementRate' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' },
              ],
            },
            {
              dateRanges,
              dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
              metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
              orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
              limit: 10,
            },
            {
              dateRanges,
              dimensions: [{ name: 'sessionDefaultChannelGroup' }],
              metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
              orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
              limit: 8,
            },
            {
              dateRanges,
              dimensions: [{ name: 'eventName' }],
              metrics: [{ name: 'eventCount' }],
              dimensionFilter: {
                filter: {
                  fieldName: 'eventName',
                  inListFilter: {
                    values: [
                      'whatsapp_click',
                      'ad_banner_click',
                      'utility_call_click',
                      'news_tip_submitted',
                    ],
                  },
                },
              },
            },
          ],
        }),
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      return emptyGa4Data(
        'api_error',
        `Erro na API GA4 (${res.status}): ${errBody.slice(0, 180)}`
      )
    }

    const batch = (await res.json()) as Ga4BatchReportResponse
    const reports = batch.reports || []

    const summaryVals = reports[0]?.rows?.[0]?.metricValues || []
    const num = (i: number) => Number(summaryVals[i]?.value || 0)

    const topPages: Ga4TopPageRow[] = (reports[1]?.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || '/',
      title: row.dimensionValues?.[1]?.value || '(Sem título)',
      views: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
    }))

    const trafficSources: Ga4ChannelRow[] = (reports[2]?.rows || []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value || 'Outros',
      sessions: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
    }))

    const eventMap = new Map<string, number>()
    for (const row of reports[3]?.rows || []) {
      const name = row.dimensionValues?.[0]?.value || ''
      const count = Number(row.metricValues?.[0]?.value || 0)
      if (name) eventMap.set(name, count)
    }

    return {
      source: 'ga4_data_api',
      statusMessage: 'Dados oficiais obtidos diretamente via Google Analytics Data API v1beta.',
      summary: {
        activeUsers: Math.round(num(0)),
        newUsers: Math.round(num(1)),
        sessions: Math.round(num(2)),
        screenPageViews: Math.round(num(3)),
        engagementRate: Math.round(num(4) * 1000) / 10,
        averageSessionDurationSec: Math.round(num(5)),
        bounceRate: Math.round(num(6) * 1000) / 10,
      },
      topPages,
      trafficSources,
      portalEvents: {
        whatsappClicks: Math.round(eventMap.get('whatsapp_click') || 0),
        adBannerClicks: Math.round(eventMap.get('ad_banner_click') || 0),
        utilityCallClicks: Math.round(eventMap.get('utility_call_click') || 0),
        newsTipsSubmitted: Math.round(eventMap.get('news_tip_submitted') || 0),
      },
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha desconhecida ao consultar GA4.'
    return emptyGa4Data('api_error', msg)
  }
}

async function fetchPortalDatabaseMetrics(period: ReportPeriod): Promise<PortalDbMetrics> {
  const [
    publishedPostsTotal,
    postsPublishedInPeriod,
    viewsAgg,
    leadsReceivedInPeriod,
    activeJobsTotal,
    upcomingEventsTotal,
    topPosts,
  ] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({
      where: {
        published: true,
        publishedAt: { gte: period.startDateObj, lte: period.endDateObj },
      },
    }),
    prisma.post.aggregate({
      where: { published: true },
      _sum: { views: true },
    }),
    prisma.lead.count({
      where: {
        createdAt: { gte: period.startDateObj, lte: period.endDateObj },
      },
    }),
    prisma.job.count({ where: { published: true } }),
    prisma.event.count({ where: { published: true } }),
    prisma.post.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: [{ views: 'desc' }, { publishedAt: 'desc' }],
      take: 10,
    }),
  ])

  return {
    publishedPostsTotal,
    postsPublishedInPeriod,
    totalRecordedViews: viewsAgg._sum.views || 0,
    leadsReceivedInPeriod,
    activeJobsTotal,
    upcomingEventsTotal,
    topArticles: topPosts.map((p) => ({
      title: p.title,
      slug: p.slug,
      views: p.views,
      categoryName: p.category?.name || 'Geral',
      publishedAt: formatDateBr(new Date(p.publishedAt)),
    })),
  }
}

export async function buildAnalyticsReportPayload(
  overrideFrequency?: ReportFrequency,
  overrideRecipientEmail?: string
): Promise<AnalyticsReportPayload> {
  const settings = await getSiteSeoSettings()
  const frequency = overrideFrequency || settings.reportFrequency
  const period = getReportPeriod(frequency)
  const readiness = getAnalyticsIntegrationReadiness(settings)

  const [ga4, portalDb] = await Promise.all([
    fetchGa4DataApiMetrics(settings.gaPropertyId, period),
    fetchPortalDatabaseMetrics(period),
  ])

  return {
    generatedAt: new Date().toISOString(),
    portalName: SITE_NAME,
    portalUrl: SITE_URL,
    recipientEmail: overrideRecipientEmail?.trim() || settings.reportRecipientEmail,
    period: {
      frequency: period.frequency,
      days: period.days,
      label: period.label,
      startDate: period.startDate,
      endDate: period.endDate,
    },
    readiness,
    ga4,
    portalDb,
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${String(secs).padStart(2, '0')}s`
}

export function renderAnalyticsReportHtml(payload: AnalyticsReportPayload): string {
  const { ga4, portalDb, period } = payload
  const isLiveGa4 = ga4.source === 'ga4_data_api'

  const topRowsHtml =
    ga4.topPages.length > 0
      ? ga4.topPages
          .map(
            (row, idx) => `
          <tr>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;">${idx + 1}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;">
              <strong>${escapeHtml(row.title)}</strong><br/>
              <span style="color:#64748b;font-size:11px;">${escapeHtml(row.path)}</span>
            </td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#0038a8;">${row.views.toLocaleString('pt-BR')}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f172a;">${row.users.toLocaleString('pt-BR')}</td>
          </tr>`
          )
          .join('')
      : portalDb.topArticles
          .map(
            (art, idx) => `
          <tr>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;">${idx + 1}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;">
              <strong>${escapeHtml(art.title)}</strong><br/>
              <span style="color:#64748b;font-size:11px;">${escapeHtml(art.categoryName)} · /noticia/${escapeHtml(art.slug)}</span>
            </td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#0038a8;">${art.views.toLocaleString('pt-BR')}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#64748b;font-size:12px;">${escapeHtml(art.publishedAt)}</td>
          </tr>`
          )
          .join('')

  const channelsHtml =
    ga4.trafficSources.length > 0
      ? ga4.trafficSources
          .map(
            (ch) => `
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;">${escapeHtml(ch.channel)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;">${ch.sessions.toLocaleString('pt-BR')}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">${ch.users.toLocaleString('pt-BR')}</td>
          </tr>`
          )
          .join('')
      : `<tr><td colspan="3" style="padding:10px;color:#64748b;font-size:12px;">Detalhamento por canal será exibido após ativar a API do GA4.</td></tr>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatório de Desempenho — ${escapeHtml(payload.portalName)}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #cbd5e1;">
    <tr>
      <td style="background:#0038a8;padding:24px 28px;color:#ffffff;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;opacity:0.85;font-weight:bold;">
          Relatório Periódico de Audiência &amp; SEO
        </div>
        <h1 style="margin:6px 0 4px 0;font-size:24px;line-height:1.2;">${escapeHtml(payload.portalName)}</h1>
        <div style="font-size:13px;opacity:0.9;">${escapeHtml(period.label)}</div>
      </td>
    </tr>

    ${
      !isLiveGa4
        ? `<tr>
            <td style="padding:14px 28px;background:#fef3c7;border-bottom:1px solid #fde68a;font-size:12px;color:#92400e;">
              <strong>Aviso de Integração GA4:</strong> ${escapeHtml(ga4.statusMessage)} Exibindo métricas internas do portal como base preliminar.
            </td>
          </tr>`
        : ''
    }

    <tr>
      <td style="padding:24px 28px 8px 28px;">
        <h2 style="margin:0 0 14px 0;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;color:#0f172a;border-bottom:2px solid #0f172a;padding-bottom:6px;">
          Resumo de Audiência (${isLiveGa4 ? 'Google Analytics 4' : 'Prévia Interna do Portal'})
        </h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="8">
          <tr>
            <td width="33%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
              <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;">Usuários Ativos</div>
              <div style="font-size:22px;font-weight:bold;color:#0038a8;margin-top:4px;">${ga4.summary.activeUsers.toLocaleString('pt-BR')}</div>
            </td>
            <td width="33%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
              <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;">Sessões</div>
              <div style="font-size:22px;font-weight:bold;color:#0f172a;margin-top:4px;">${ga4.summary.sessions.toLocaleString('pt-BR')}</div>
            </td>
            <td width="33%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
              <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;">Visualizações</div>
              <div style="font-size:22px;font-weight:bold;color:#c8102e;margin-top:4px;">${(isLiveGa4 ? ga4.summary.screenPageViews : portalDb.totalRecordedViews).toLocaleString('pt-BR')}</div>
            </td>
          </tr>
          <tr>
            <td width="33%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
              <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;">Engajamento</div>
              <div style="font-size:18px;font-weight:bold;color:#0f172a;margin-top:4px;">${ga4.summary.engagementRate}%</div>
            </td>
            <td width="33%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
              <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;">Tempo Médio</div>
              <div style="font-size:18px;font-weight:bold;color:#0f172a;margin-top:4px;">${formatDuration(ga4.summary.averageSessionDurationSec)}</div>
            </td>
            <td width="33%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
              <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;">Matérias Publicadas</div>
              <div style="font-size:18px;font-weight:bold;color:#0f172a;margin-top:4px;">+${portalDb.postsPublishedInPeriod} <span style="font-size:11px;font-weight:normal;color:#64748b;">(${portalDb.publishedPostsTotal} total)</span></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:16px 28px;">
        <h2 style="margin:0 0 10px 0;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;color:#0f172a;border-bottom:2px solid #0f172a;padding-bottom:6px;">
          Top Matérias e Páginas
        </h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;">#</th>
              <th style="padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;">Página / Matéria</th>
              <th style="padding:8px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;">Leituras</th>
              <th style="padding:8px 10px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;">${isLiveGa4 ? 'Usuários' : 'Data'}</th>
            </tr>
          </thead>
          <tbody>${topRowsHtml}</tbody>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:12px 28px 20px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="10">
          <tr>
            <td width="55%" valign="top" style="border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
              <div style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#0f172a;margin-bottom:8px;">
                Origem do Tráfego
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${channelsHtml}
              </table>
            </td>
            <td width="45%" valign="top" style="border:1px solid #e2e8f0;border-radius:6px;padding:12px;background:#f8fafc;">
              <div style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#0f172a;margin-bottom:8px;">
                Conversões do Bairro
              </div>
              <div style="font-size:13px;line-height:1.8;color:#334155;">
                • Cliques WhatsApp: <strong>${ga4.portalEvents.whatsappClicks}</strong><br/>
                • Cliques em Banners: <strong>${ga4.portalEvents.adBannerClicks}</strong><br/>
                • Envios no Formulário: <strong>${portalDb.leadsReceivedInPeriod}</strong><br/>
                • Vagas Ativas no Mural: <strong>${portalDb.activeJobsTotal}</strong>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="background:#0f172a;color:#cbd5e1;padding:16px 28px;font-size:11px;line-height:1.6;">
        Relatório automático preparado para <strong style="color:#ffffff;">${escapeHtml(payload.portalName)}</strong> (${escapeHtml(payload.portalUrl)}).<br/>
        Gerado em ${escapeHtml(new Date(payload.generatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))}.
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function renderAnalyticsReportText(payload: AnalyticsReportPayload): string {
  const { ga4, portalDb, period } = payload
  const lines = [
    `RELATÓRIO DE AUDIÊNCIA — ${payload.portalName}`,
    `Período: ${period.label}`,
    `Site: ${payload.portalUrl}`,
    '',
    `Status GA4: ${ga4.statusMessage}`,
    `Usuários Ativos: ${ga4.summary.activeUsers}`,
    `Sessões: ${ga4.summary.sessions}`,
    `Visualizações (GA4): ${ga4.summary.screenPageViews}`,
    `Visualizações internas no portal: ${portalDb.totalRecordedViews}`,
    `Matérias publicadas no período: ${portalDb.postsPublishedInPeriod} (${portalDb.publishedPostsTotal} no total)`,
    `Pautas recebidas dos leitores: ${portalDb.leadsReceivedInPeriod}`,
    `Vagas ativas no mural: ${portalDb.activeJobsTotal}`,
    '',
    'Top Matérias:',
    ...(ga4.topPages.length > 0
      ? ga4.topPages.map((p, i) => `${i + 1}. ${p.title} (${p.path}) — ${p.views} views`)
      : portalDb.topArticles.map((a, i) => `${i + 1}. ${a.title} (/noticia/${a.slug}) — ${a.views} leituras`)),
  ]
  return lines.join('\n')
}

export async function sendAnalyticsReportEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<EmailDispatchResult> {
  const recipient = to.trim()
  if (!recipient) {
    return {
      sent: false,
      provider: 'none',
      reason: 'E-mail de destino (ANALYTICS_REPORT_EMAIL) não configurado.',
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim()
  const fromEmail =
    process.env.ANALYTICS_EMAIL_FROM?.trim() || 'Relatórios Lavras Notícia <relatorios@lavrasnoticias.com>'

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: recipient.split(',').map((e) => e.trim()).filter(Boolean),
          subject,
          html,
          text,
        }),
      })

      const data = (await res.json()) as { id?: string; message?: string }
      if (!res.ok) {
        return {
          sent: false,
          provider: 'resend',
          reason: data.message || `Resend HTTP ${res.status}`,
        }
      }

      return {
        sent: true,
        provider: 'resend',
        messageId: data.id,
      }
    } catch (err: unknown) {
      return {
        sent: false,
        provider: 'resend',
        reason: err instanceof Error ? err.message : 'Erro ao enviar via Resend.',
      }
    }
  }

  const webhookUrl = process.env.ANALYTICS_EMAIL_WEBHOOK_URL?.trim()
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, subject, html, text }),
      })

      if (!res.ok) {
        return {
          sent: false,
          provider: 'webhook',
          reason: `Webhook HTTP ${res.status}`,
        }
      }

      return {
        sent: true,
        provider: 'webhook',
      }
    } catch (err: unknown) {
      return {
        sent: false,
        provider: 'webhook',
        reason: err instanceof Error ? err.message : 'Erro ao chamar webhook de e-mail.',
      }
    }
  }

  return {
    sent: false,
    provider: 'none',
    reason: 'Nenhuma credencial de envio configurada (defina RESEND_API_KEY ou ANALYTICS_EMAIL_WEBHOOK_URL).',
  }
}

export async function recordReportExecutionStatus(
  sentAtIso: string | null,
  statusSummary: string
): Promise<void> {
  const entries: Array<{ key: string; value: string }> = [
    { key: 'analytics_report_last_status', value: statusSummary },
  ]
  if (sentAtIso) {
    entries.push({ key: 'analytics_report_last_sent_at', value: sentAtIso })
  }

  for (const item of entries) {
    await prisma.siteSetting.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value },
    })
  }
}
