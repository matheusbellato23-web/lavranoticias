'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  Eye,
  Inbox,
  Briefcase,
  Calendar,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Layers,
} from 'lucide-react'

// ---- Types ----
interface CategoryCount { name: string; count: number }
interface MonthPoint { month: string; label: string; posts: number }
interface TopArticle {
  title: string; slug: string; views: number; category: string; publishedAt: string
}
interface GaReadiness {
  gaMeasurementIdConfigured: boolean
  gaPropertyIdConfigured: boolean
  gaServiceAccountConfigured: boolean
  readyForLiveGa4: boolean
  readyForAutoEmail: boolean
}
interface DashData {
  ga: { measurementId: string; propertyId: string; readiness: GaReadiness }
  db: {
    totalPosts: number; postsLast30: number; postsLast7: number
    totalCategories: number; totalJobs: number; totalEvents: number
    totalLeads: number; leadsLast30: number
    topArticles: TopArticle[]
    monthsChart: MonthPoint[]
    categoryCounts: CategoryCount[]
  }
}

// ---- Bar Chart SVG (puro, sem lib) ----
function BarChart({ data }: { data: MonthPoint[] }) {
  const max = Math.max(...data.map((d) => d.posts), 1)
  const H = 120
  const barW = 32
  const gap = 12
  const totalW = data.length * (barW + gap) - gap + 24

  return (
    <svg viewBox={`0 0 ${totalW} ${H + 28}`} width="100%" style={{ maxHeight: 160 }}>
      {data.map((d, i) => {
        const barH = Math.max(4, Math.round((d.posts / max) * H))
        const x = 12 + i * (barW + gap)
        const y = H - barH
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#2563eb" opacity={0.85} />
            {d.posts > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#1e40af" fontWeight="600">
                {d.posts}
              </text>
            )}
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize={9} fill="#94a3b8">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---- KPI Card ----
function KpiCard({
  icon: Icon, label, value, sub, color = 'blue',
}: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  }
  const cls = colors[color] ?? colors.blue
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${cls}`}>
      <div className="flex items-center gap-2 text-xs font-semibold opacity-70 uppercase tracking-wider">
        <Icon size={14} />
        {label}
      </div>
      <div className="text-3xl font-archivo-black leading-none">{value}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </div>
  )
}

// ---- Status dot ----
function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok
        ? <CheckCircle2 size={15} className="text-emerald-500" />
        : <XCircle size={15} className="text-slate-300" />}
      <span className={ok ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
    </div>
  )
}

// ---- Main Page ----
export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analytics/dashboard')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.ok) throw new Error(json.error ?? 'Erro desconhecido')
      setData(json)
      setLastUpdated(new Date())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-archivo-black text-slate-900 flex items-center gap-2">
            <BarChart3 size={22} className="text-blue-600" />
            Analytics & Desempenho
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Métricas do portal · Dados do banco + integração Google Analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <a
            href={`https://analytics.google.com/analytics/web/#/p${data?.ga.propertyId || ''}/reports/reportinghub`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
          >
            Abrir GA4
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* KPI Grid */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers size={12} /> Métricas do Portal
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <KpiCard icon={FileText} label="Artigos publicados" value={data.db.totalPosts} sub={`+${data.db.postsLast30} nos últimos 30 dias`} color="blue" />
              <KpiCard icon={TrendingUp} label="Publicados esta semana" value={data.db.postsLast7} sub="últimos 7 dias" color="emerald" />
              <KpiCard icon={Layers} label="Categorias" value={data.db.totalCategories} color="violet" />
              <KpiCard icon={Inbox} label="Sugestões recebidas" value={data.db.totalLeads} sub={`+${data.db.leadsLast30} nos últimos 30 dias`} color="amber" />
              <KpiCard icon={Briefcase} label="Vagas ativas" value={data.db.totalJobs} color="emerald" />
              <KpiCard icon={Calendar} label="Eventos futuros" value={data.db.totalEvents} color="violet" />
            </div>
          </div>

          {/* Gráfico + Categorias */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Publicações por mês */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 size={15} className="text-blue-600" />
                Publicações por mês
              </h2>
              <BarChart data={data.db.monthsChart} />
            </div>

            {/* Top categorias */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Layers size={15} className="text-violet-600" />
                Artigos por editoria
              </h2>
              <div className="space-y-2">
                {data.db.categoryCounts.map((c) => {
                  const pct = data.db.totalPosts > 0 ? Math.round((c.count / data.db.totalPosts) * 100) : 0
                  return (
                    <div key={c.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{c.name}</span>
                        <span className="text-slate-400">{c.count} art. · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Top artigos */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Eye size={15} className="text-emerald-600" />
              Top 10 artigos mais vistos
            </h2>
            {data.db.topArticles.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum dado de visualização registrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left pb-2 text-slate-400 font-semibold w-6">#</th>
                      <th className="text-left pb-2 text-slate-400 font-semibold">Artigo</th>
                      <th className="text-left pb-2 text-slate-400 font-semibold hidden sm:table-cell">Editoria</th>
                      <th className="text-right pb-2 text-slate-400 font-semibold">Views</th>
                      <th className="text-right pb-2 text-slate-400 font-semibold w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.db.topArticles.map((art, i) => (
                      <tr key={art.slug} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 text-slate-300 font-mono">{i + 1}</td>
                        <td className="py-2.5 pr-4">
                          <span className="font-semibold text-slate-800 line-clamp-1">{art.title}</span>
                        </td>
                        <td className="py-2.5 hidden sm:table-cell">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            {art.category}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-blue-700">
                          {art.views.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2.5 text-right">
                          <Link
                            href={`/noticias/${art.slug}`}
                            target="_blank"
                            className="text-slate-300 hover:text-blue-600 transition-colors"
                          >
                            <ArrowUpRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Status GA4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={15} className="text-blue-600" />
              Integração Google Analytics 4
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <StatusDot ok={data.ga.readiness.gaMeasurementIdConfigured} label="Measurement ID configurado" />
                <StatusDot ok={data.ga.readiness.gaPropertyIdConfigured} label="Property ID numérico configurado" />
                <StatusDot ok={data.ga.readiness.gaServiceAccountConfigured} label="Service Account configurada" />
                <StatusDot ok={data.ga.readiness.readyForLiveGa4} label="API GA4 Data ativa (relatórios automáticos)" />
                <StatusDot ok={data.ga.readiness.readyForAutoEmail} label="Envio automático de relatório por e-mail" />
              </div>
              <div className="space-y-3">
                {data.ga.measurementId && (
                  <div className="text-xs">
                    <div className="text-slate-400 mb-0.5">Measurement ID ativo</div>
                    <code className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono text-[11px]">
                      {data.ga.measurementId}
                    </code>
                  </div>
                )}
                {!data.ga.readiness.readyForLiveGa4 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <strong>Para ativar métricas GA4 em tempo real:</strong>
                    <ol className="mt-1.5 space-y-1 list-decimal list-inside">
                      <li>Configure o <strong>Property ID numérico</strong> em <Link href="/admin/seo" className="underline">SEO & Analytics</Link></li>
                      <li>Adicione as variáveis de ambiente <code>GA4_SERVICE_ACCOUNT_EMAIL</code> + <code>GA4_PRIVATE_KEY</code> no Coolify</li>
                    </ol>
                  </div>
                )}
                <a
                  href="https://analytics.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                >
                  Abrir Google Analytics 4
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
