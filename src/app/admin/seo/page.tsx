'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Globe,
  FileCode2,
  Mail,
  Send,
  Eye,
} from 'lucide-react'

interface ReadinessStatus {
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

export default function AdminSeoPage() {
  const [gaMeasurementId, setGaMeasurementId] = useState('')
  const [gtmId, setGtmId] = useState('')
  const [googleSiteVerification, setGoogleSiteVerification] = useState('')
  const [defaultDescription, setDefaultDescription] = useState('')
  const [defaultOgImage, setDefaultOgImage] = useState('')
  const [gaPropertyId, setGaPropertyId] = useState('')
  const [reportRecipientEmail, setReportRecipientEmail] = useState('')
  const [reportFrequency, setReportFrequency] = useState<'monthly' | 'biweekly'>('monthly')
  const [reportEnabled, setReportEnabled] = useState(false)
  const [lastStatus, setLastStatus] = useState('')
  const [readiness, setReadiness] = useState<ReadinessStatus | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingReport, setTestingReport] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const loadReadiness = () => {
    fetch('/api/analytics/report')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.readiness) setReadiness(data.readiness)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setGaMeasurementId(data.gaMeasurementId || '')
        setGtmId(data.gtmId || '')
        setGoogleSiteVerification(data.googleSiteVerification || '')
        setDefaultDescription(data.defaultDescription || '')
        setDefaultOgImage(data.defaultOgImage || '/assets/hero-bairro.jpg')
        setGaPropertyId(data.gaPropertyId || '')
        setReportRecipientEmail(data.reportRecipientEmail || '')
        setReportFrequency(data.reportFrequency === 'biweekly' ? 'biweekly' : 'monthly')
        setReportEnabled(Boolean(data.reportEnabled))
        setLastStatus(data.reportLastStatus || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    loadReadiness()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gaMeasurementId,
          gtmId,
          googleSiteVerification,
          defaultDescription,
          defaultOgImage,
          gaPropertyId,
          reportRecipientEmail,
          reportFrequency,
          reportEnabled,
        }),
      })
      const data = await res.json()
      if (res.ok && data.settings) {
        setGaMeasurementId(data.settings.gaMeasurementId || '')
        setGtmId(data.settings.gtmId || '')
        setGoogleSiteVerification(data.settings.googleSiteVerification || '')
        setGaPropertyId(data.settings.gaPropertyId || '')
        setReportRecipientEmail(data.settings.reportRecipientEmail || '')
        setReportFrequency(data.settings.reportFrequency || 'monthly')
        setReportEnabled(Boolean(data.settings.reportEnabled))
        setFeedback({
          type: 'ok',
          msg: 'Configurações técnicas de Analytics, Tag Manager e Relatórios salvas com sucesso!',
        })
        loadReadiness()
      } else {
        setFeedback({ type: 'err', msg: data.error || 'Erro ao salvar configurações.' })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Erro de conexão ao salvar configurações.' })
    } finally {
      setSaving(false)
    }
  }

  const handleTestReport = async (dryRun: boolean) => {
    setTestingReport(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: reportFrequency,
          recipientEmail: reportRecipientEmail,
          force: true,
          dryRun,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setFeedback({
          type: 'ok',
          msg: dryRun
            ? `Simulação (dry-run) OK: "${data.subject}" (${data.htmlPreviewLength} bytes HTML gerados).`
            : `Relatório enviado via ${data.dispatch?.provider} para ${data.recipientEmail}!`,
        })
        loadReadiness()
      } else {
        setFeedback({
          type: 'err',
          msg: data.dispatch?.reason || data.error || 'Pendente credencial de e-mail para disparo real.',
        })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Erro ao executar endpoint /api/analytics/report.' })
    } finally {
      setTestingReport(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
        <strong>Painel Técnico Interno (Webco Agency):</strong> esta rota (<code>/admin/seo</code>) foi ocultada do menu lateral do cliente e permanece acessível apenas diretamente pela URL ou variáveis de ambiente no Coolify.
      </div>

      <div>
        <h1 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black">
          SEO, Google Analytics &amp; Relatórios
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-archivo mt-1">
          Parametrização de Google Analytics 4, Tag Manager, Search Console, Web Vitals e backend de relatórios periódicos por e-mail.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-2 font-medium ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-10 border border-slate-200 text-center text-sm text-slate-400">
          Carregando configurações...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Google Analytics 4 & Tag Manager */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <BarChart3 className="text-primary" size={20} />
              <div>
                <h2 className="font-archivo-black text-base text-editorial-black">
                  Google Analytics 4 (GA4) &amp; Tag Manager
                </h2>
                <p className="text-xs text-slate-500">
                  Injeta gtag.js / GTM no <code>&lt;head&gt;</code> com Web Vitals (LCP, INP, CLS, FCP, TTFB) e eventos de conversão.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  GA4 Measurement ID
                </label>
                <input
                  type="text"
                  placeholder="Ex: G-XXXXXXXXXX"
                  value={gaMeasurementId}
                  onChange={(e) => setGaMeasurementId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ou via env var <code>NEXT_PUBLIC_GA_ID</code> no Coolify.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Google Tag Manager ID (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: GTM-XXXXXXX"
                  value={gtmId}
                  onChange={(e) => setGtmId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ou via env var <code>NEXT_PUBLIC_GTM_ID</code> no Coolify.
                </p>
              </div>
            </div>
          </div>

          {/* Relatório Automático por E-mail (Mensal ou a cada 15 dias) */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Mail className="text-primary" size={20} />
              <div>
                <h2 className="font-archivo-black text-base text-editorial-black">
                  Relatório Automático por E-mail (Backend Mapeado)
                </h2>
                <p className="text-xs text-slate-500">
                  Endpoint <code>/api/analytics/report</code> pronto para cron quinzenal (15 dias) ou mensal via Resend/Webhook.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  GA4 Property ID (Numérico)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 461234567"
                  value={gaPropertyId}
                  onChange={(e) => setGaPropertyId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  E-mail do Cliente
                </label>
                <input
                  type="email"
                  placeholder="cliente@empresa.com.br"
                  value={reportRecipientEmail}
                  onChange={(e) => setReportRecipientEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Periodicidade
                </label>
                <select
                  value={reportFrequency}
                  onChange={(e) => setReportFrequency(e.target.value as 'monthly' | 'biweekly')}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary"
                >
                  <option value="monthly">Mensal (30 dias)</option>
                  <option value="biweekly">Quinzenal (a cada 15 dias)</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={reportEnabled}
                onChange={(e) => setReportEnabled(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span>Habilitar envio automático quando acionado pelo cron (/api/analytics/report)</span>
            </label>

            {readiness && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
                <p className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">
                  Checklist de Integração:
                </p>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  <span>{readiness.gaMeasurementIdConfigured ? '✅' : '⏳'} Tag GA4 (<code>NEXT_PUBLIC_GA_ID</code>)</span>
                  <span>{readiness.gaPropertyIdConfigured ? '✅' : '⏳'} GA4 Property ID (<code>GA4_PROPERTY_ID</code>)</span>
                  <span>{readiness.gaServiceAccountConfigured ? '✅' : '⏳'} Service Account GA4 Data API</span>
                  <span>{readiness.emailProviderConfigured ? '✅' : '⏳'} Envio E-mail (<code>RESEND_API_KEY</code> / Webhook)</span>
                  <span>{readiness.cronSecretConfigured ? '✅' : '⏳'} Segredo Cron (<code>ANALYTICS_CRON_SECRET</code>)</span>
                  <span>{readiness.recipientEmailConfigured ? '✅' : '⏳'} Destinatário configurado</span>
                </div>
                {lastStatus && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <strong>Última execução:</strong> {lastStatus}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={`/api/analytics/report?frequency=${reportFrequency}&format=html`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Eye size={14} /> Pré-visualizar E-mail (HTML)
              </a>

              <button
                type="button"
                disabled={testingReport}
                onClick={() => handleTestReport(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-60"
              >
                Simular Dry-Run JSON
              </button>

              <button
                type="button"
                disabled={testingReport}
                onClick={() => handleTestReport(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-60"
              >
                <Send size={14} /> Disparar Envio Agora
              </button>
            </div>
          </div>

          {/* Google Search Console & Meta Padrão */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Search className="text-primary" size={20} />
              <div>
                <h2 className="font-archivo-black text-base text-editorial-black">
                  Google Search Console &amp; Meta Tags SEO
                </h2>
                <p className="text-xs text-slate-500">
                  Verificação de propriedade e metainformações padrão.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tag ou Código de Verificação do Google Search Console
              </label>
              <input
                type="text"
                placeholder='Cole o código ou a tag <meta name="google-site-verification" content="..." />'
                value={googleSiteVerification}
                onChange={(e) => setGoogleSiteVerification(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Descrição Principal no Google (Meta Description da Capa)
              </label>
              <textarea
                rows={3}
                value={defaultDescription}
                onChange={(e) => setDefaultDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Imagem Padrão de Compartilhamento
              </label>
              <input
                type="text"
                value={defaultOgImage}
                onChange={(e) => setDefaultOgImage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-lg shadow transition-all disabled:opacity-60"
              >
                <Save size={16} />
                <span>{saving ? 'Salvando...' : 'Salvar Todas as Configurações'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Recursos Técnicos Ativos no Portal */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Globe className="text-emerald-600" size={20} />
          <div>
            <h2 className="font-archivo-black text-base text-editorial-black">
              Sitemaps e Dados Estruturados Ativos
            </h2>
            <p className="text-xs text-slate-500">
              Recursos automáticos para indexação no Google e Google Notícias.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-editorial-black flex items-center gap-1.5">
                <FileCode2 size={14} className="text-primary" /> Sitemap Geral
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">/sitemap.xml</p>
            </div>
            <ExternalLink size={14} className="text-slate-400" />
          </a>

          <a
            href="/sitemap-news.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-editorial-black flex items-center gap-1.5">
                <FileCode2 size={14} className="text-accent" /> Google Notícias
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">/sitemap-news.xml</p>
            </div>
            <ExternalLink size={14} className="text-slate-400" />
          </a>

          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-editorial-black flex items-center gap-1.5">
                <FileCode2 size={14} className="text-emerald-600" /> Robots.txt
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">/robots.txt</p>
            </div>
            <ExternalLink size={14} className="text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  )
}
