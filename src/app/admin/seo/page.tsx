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
} from 'lucide-react'

export default function AdminSeoPage() {
  const [gaMeasurementId, setGaMeasurementId] = useState('')
  const [googleSiteVerification, setGoogleSiteVerification] = useState('')
  const [defaultDescription, setDefaultDescription] = useState('')
  const [defaultOgImage, setDefaultOgImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setGaMeasurementId(data.gaMeasurementId || '')
        setGoogleSiteVerification(data.googleSiteVerification || '')
        setDefaultDescription(data.defaultDescription || '')
        setDefaultOgImage(data.defaultOgImage || '/assets/hero-bairro.jpg')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
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
          googleSiteVerification,
          defaultDescription,
          defaultOgImage,
        }),
      })
      const data = await res.json()
      if (res.ok && data.settings) {
        setGaMeasurementId(data.settings.gaMeasurementId || '')
        setGoogleSiteVerification(data.settings.googleSiteVerification || '')
        setFeedback({
          type: 'ok',
          msg: 'Configurações de SEO e Google Analytics salvas e ativadas no site!',
        })
      } else {
        setFeedback({ type: 'err', msg: data.error || 'Erro ao salvar configurações.' })
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Erro de conexão ao salvar configurações.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black">
          SEO, Google & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-archivo mt-1">
          Configure o Google Analytics 4, a verificação do Google Search Console e acompanhe os sitemaps automáticos de indexação.
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
          {/* Google Analytics 4 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <BarChart3 className="text-primary" size={20} />
              <div>
                <h2 className="font-archivo-black text-base text-editorial-black">
                  Google Analytics 4 (GA4)
                </h2>
                <p className="text-xs text-slate-500">
                  Acompanhe acessos em tempo real, matérias mais lidas e origem do tráfego.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                ID da Métrica (Measurement ID)
              </label>
              <input
                type="text"
                placeholder="Ex: G-ABC123XYZ9"
                value={gaMeasurementId}
                onChange={(e) => setGaMeasurementId(e.target.value)}
                className="w-full sm:max-w-md rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Onde pegar: Acesse{' '}
                <a
                  href="https://analytics.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  analytics.google.com
                </a>{' '}
                → Administrador → Fluxos de dados → Web → copie o <strong>ID da métrica</strong> (começa com <code>G-</code>). Assim que salvar aqui, o rastreamento entra no ar automaticamente em todo o portal (ignorando acessos internos do painel).
              </p>
            </div>
          </div>

          {/* Google Search Console & Meta Padrão */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Search className="text-primary" size={20} />
              <div>
                <h2 className="font-archivo-black text-base text-editorial-black">
                  Google Search Console & Meta Tags SEO
                </h2>
                <p className="text-xs text-slate-500">
                  Comprove propriedade no Google para enviar o sitemap e acompanhar o ranqueamento das palavras-chave.
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
              <p className="text-[11px] text-slate-500 mt-1.5">
                No{' '}
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google Search Console
                </a>
                , escolha a opção <strong>Tag HTML</strong> e cole aqui (pode colar a tag inteira que extraímos o código automaticamente).
              </p>
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
              <p className="text-[11px] text-slate-400 mt-1">
                Recomendado: entre 120 e 160 caracteres ({defaultDescription.length} caracteres).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Imagem Padrão de Compartilhamento (WhatsApp / Redes / Google)
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
                <span>{saving ? 'Salvando...' : 'Salvar Configurações SEO'}</span>
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
              Recursos já gerados automaticamente para indexação rápida no Google e Google Notícias.
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

        <ul className="text-xs text-slate-600 space-y-1.5 pt-2 list-disc pl-5">
          <li>
            <strong>Schema.org JSON-LD:</strong> Marcação estruturada <code>NewsMediaOrganization</code> na capa, <code>NewsArticle</code> + <code>BreadcrumbList</code> em cada notícia e <code>CollectionPage</code> nas categorias.
          </li>
          <li>
            <strong>Google Discover:</strong> Meta tag <code>max-image-preview:large</code> habilitada para exibir fotos em tamanho grande nos resultados e feed do Google.
          </li>
          <li>
            <strong>URLs Canônicas e Proteção Admin:</strong> Todas as rotas possuem tag <code>canonical</code> oficial e o <code>/admin</code> é bloqueado para indexação (<code>noindex</code>).
          </li>
        </ul>
      </div>
    </div>
  )
}
