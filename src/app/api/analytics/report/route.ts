import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth'
import { getSiteSeoSettings, type ReportFrequency } from '@/lib/seo'
import {
  buildAnalyticsReportPayload,
  isReportDue,
  recordReportExecutionStatus,
  renderAnalyticsReportHtml,
  renderAnalyticsReportText,
  sendAnalyticsReportEmail,
} from '@/lib/analytics-report'

export const dynamic = 'force-dynamic'

function verifyCronSecret(request: Request): boolean {
  const configured = process.env.ANALYTICS_CRON_SECRET?.trim()
  if (!configured) return false

  const authHeader = request.headers.get('authorization') || ''
  const bearer = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : ''
  const customHeader = request.headers.get('x-cron-secret')?.trim() || ''
  const candidate = bearer || customHeader

  if (!candidate || candidate.length !== configured.length) return false
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(configured))
}

async function isAuthorized(request: Request): Promise<boolean> {
  if (verifyCronSecret(request)) return true
  const admin = await getCurrentAdmin()
  return Boolean(admin)
}

function parseFrequency(raw?: string | null): ReportFrequency | undefined {
  if (!raw) return undefined
  const val = raw.trim().toLowerCase()
  if (val === 'biweekly') return 'biweekly'
  if (val === 'monthly') return 'monthly'
  return undefined
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const frequency = parseFrequency(searchParams.get('frequency'))
  const format = searchParams.get('format')?.toLowerCase()

  const payload = await buildAnalyticsReportPayload(frequency)

  if (format === 'html') {
    const html = renderAnalyticsReportHtml(payload)
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  }

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: {
    frequency?: string
    recipientEmail?: string
    force?: boolean
    dryRun?: boolean
  } = {}

  try {
    const raw = await request.text()
    if (raw) body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Payload JSON inválido' }, { status: 400 })
  }

  const settings = await getSiteSeoSettings()
  const frequency = parseFrequency(body.frequency) || settings.reportFrequency
  const recipientEmail = (body.recipientEmail || settings.reportRecipientEmail).trim()
  const force = Boolean(body.force)
  const dryRun = Boolean(body.dryRun)

  if (!force && !dryRun && !settings.reportEnabled) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: 'Envio automático desativado nas configurações (analytics_report_enabled = false).',
    })
  }

  if (!force && !dryRun) {
    const dueCheck = isReportDue(frequency, settings.reportLastSentAt)
    if (!dueCheck.due) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: dueCheck.reason,
      })
    }
  }

  const payload = await buildAnalyticsReportPayload(frequency, recipientEmail)
  const html = renderAnalyticsReportHtml(payload)
  const text = renderAnalyticsReportText(payload)
  const subject = `[Lavras Notícia] Relatório de Audiência — ${payload.period.label}`

  if (dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      subject,
      recipientEmail,
      payload,
      htmlPreviewLength: html.length,
    })
  }

  const dispatch = await sendAnalyticsReportEmail({
    to: recipientEmail,
    subject,
    html,
    text,
  })

  if (!dispatch.sent) {
    await recordReportExecutionStatus(
      null,
      `Falha (${dispatch.provider}): ${dispatch.reason || 'erro ao enviar'}`
    )
    return NextResponse.json(
      {
        success: false,
        dispatch,
        readiness: payload.readiness,
      },
      { status: 422 }
    )
  }

  const sentAt = new Date().toISOString()
  await recordReportExecutionStatus(
    sentAt,
    `Enviado em ${new Date(sentAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} via ${dispatch.provider} para ${recipientEmail}`
  )

  return NextResponse.json({
    success: true,
    dispatch,
    sentAt,
    recipientEmail,
    period: payload.period,
  })
}
