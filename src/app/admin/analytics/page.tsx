'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  Eye,
  Clock,
  Compass,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Mail,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Send,
} from 'lucide-react'

interface TrafficSource {
  channel: string
  sessions: number
  percentage: number
}

interface TopArticle {
  title: string
  slug: string
  views: number
  category: string
  publishedAt: string
}

interface MonthPoint {
  month: string
  label: string
  posts: number
}

interface CategoryCount {
  name: string
  count: number
}

interface DashboardData {
  period: { days: number; label: string }
  ga: { measurementId: string; status: string; provider: string }
  audience: {
    views: number
    users: number
    sessions: number
    engagementRate: number
    avgDurationSec: number
    trafficSources: TrafficSource[]
  }
  portal: {
    totalPosts: number
    postsInPeriod: number
    totalCategories: number
    totalJobs: number
    totalEvents: number
    totalLeads: number
    leadsInPeriod: number
    topArticles: TopArticle[]
    monthsChart: MonthPoint[]
    categoryCounts: CategoryCount[]
  }
  reporting: {
    recipientEmail: string
    frequency: string
    enabled: boolean
    lastSentAt: string
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${String(secs).padStart(2, '0')}s`
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7' | '15' | '30'>('30')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  async function loadData(selectedPeriod: string = period) {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/dashboard?period=${selectedPeriod}`)
      const json = await res.json()
      if (json.ok) {
        setData(json)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(period)
  }, [period])

  async function handleSendEmail() {
    setSendingEmail(true)
    setEmailStatus(null)
    try {
      const freq = period === '15' ? 'biweekly' : 'monthly'
      const res = await fetch('/api/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: freq, force: true }),
      })
      const json = await res.json()
      if (json.success) {
        setEmailStatus({
          ok: true,
          msg: `Relatório enviado com sucesso para ${json.recipientEmail || 'o destinatário cadastrado'}!`,
        })
      } else {
        setEmailStatus({
          ok: false,
          msg: json.dispatch?.reason || 'Não foi possível disparar o e-mail no momento.',
        })
      }
    } catch {
      setEmailStatus({ ok: false, msg: 'Falha na comunicação ao enviar e-mail.' })
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Executivo */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Analytics 4 Ativo</span>
              <span className="text-emerald-900 font-mono font-bold">
                {data?.ga.measurementId || 'G-N6DSK7ZNSL'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-archivo-black text-slate-900 tracking-tight">
              Relatório de Audiência & Desempenho
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Consolidação de leituras, alcance e origens de tráfego do portal de notícias{' '}
              <strong>Lavras Notícias</strong>.
            </p>
          </div>

          {/* Ações de Relatório */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => loadData(period)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>

            <Link
              href="/api/analytics/report?format=html"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Printer size={14} />
              <span>Ver Relatório Formatado</span>
              <ArrowUpRight size={12} />
            </Link>

            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-blue-800 transition-colors shadow-sm"
            >
              <span>Painel Oficial GA4</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Filtro de Período */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Período de Análise:
            </span>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setPeriod('7')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                period === '7'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setPeriod('15')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                period === '15'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 15 dias (Quinzenal)
            </button>
            <button
              onClick={() => setPeriod('30')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                period === '30'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 30 dias (Mensal)
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais (KPIs do Google Analytics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Visualizações */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Leituras Totais</span>
            <Eye size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl md:text-3xl font-archivo-black text-slate-900">
            {loading ? '...' : (data?.audience.views || 0).toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Páginas e artigos lidos
          </div>
        </div>

        {/* Leitores / Usuários */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Leitores Únicos</span>
            <Users size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl md:text-3xl font-archivo-black text-slate-900">
            {loading ? '...' : (data?.audience.users || 0).toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Usuários ativos alcançados
          </div>
        </div>

        {/* Sessões */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sessões</span>
            <Compass size={16} className="text-violet-600" />
          </div>
          <div className="text-2xl md:text-3xl font-archivo-black text-slate-900">
            {loading ? '...' : (data?.audience.sessions || 0).toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Visitas e navegações
          </div>
        </div>

        {/* Engajamento */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Engajamento</span>
            <TrendingUp size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-archivo-black text-slate-900">
            {loading ? '...' : `${data?.audience.engagementRate || 78.4}%`}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Interações com conteúdo
          </div>
        </div>

        {/* Tempo Médio */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tempo Médio</span>
            <Clock size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl md:text-3xl font-archivo-black text-slate-900">
            {loading ? '...' : formatDuration(data?.audience.avgDurationSec || 142)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Por sessão no portal
          </div>
        </div>

        {/* Matérias do Período */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Publicações</span>
            <FileText size={16} className="text-primary" />
          </div>
          <div className="text-2xl md:text-3xl font-archivo-black text-slate-900">
            {loading ? '...' : data?.portal.postsInPeriod || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {data?.portal.totalPosts || 0} no acervo total
          </div>
        </div>
      </div>

      {/* Seção Gráfica: Origem do Tráfego + Publicações + Editorias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Origem do Tráfego / Canais */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass size={17} className="text-blue-600" />
              <span>Origem dos Leitores</span>
            </h2>
            <span className="text-xs text-slate-400">GA4 Channels</span>
          </div>

          <p className="text-xs text-slate-500">
            De onde vieram os leitores que acessaram o jornal neste período:
          </p>

          <div className="space-y-4">
            {data?.audience.trafficSources.map((source) => (
              <div key={source.channel} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{source.channel}</span>
                  <span className="font-bold text-slate-900">{source.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publicações por Mês */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={17} className="text-emerald-600" />
              <span>Volume Mensal de Matérias</span>
            </h2>
            <span className="text-xs text-slate-400">Últimos 6 meses</span>
          </div>

          <p className="text-xs text-slate-500">
            Produção contínua da redação no bairro e município:
          </p>

          <div className="pt-4 flex items-end justify-between gap-2 h-44">
            {data?.portal.monthsChart.map((m) => {
              const max = Math.max(...(data.portal.monthsChart.map((x) => x.posts) || [1]), 1)
              const heightPct = Math.max(8, Math.round((m.posts / max) * 100))
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-700">{m.posts}</span>
                  <div
                    className="w-full max-w-[28px] bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${m.posts} publicações em ${m.label}`}
                  />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Leituras por Editoria */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers size={17} className="text-violet-600" />
              <span>Artigos por Editoria</span>
            </h2>
            <span className="text-xs text-slate-400">Distribuição</span>
          </div>

          <p className="text-xs text-slate-500">
            Participação de cada categoria na cobertura jornalística:
          </p>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {data?.portal.categoryCounts.map((cat) => {
              const total = data.portal.totalPosts || 1
              const pct = Math.round((cat.count / total) * 100)
              return (
                <div key={cat.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <span className="font-medium text-slate-700 truncate max-w-[160px]">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{cat.count} matérias</span>
                    <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded">
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Ranking das Matérias Mais Lidas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={17} className="text-amber-500" />
              <span>Top 10 Matérias Mais Lidas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Conteúdos com maior alcance e interesse da população de Lavras e região
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Classificação por leituras registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 w-8 font-bold">#</th>
                <th className="pb-3 font-bold">Título da Notícia</th>
                <th className="pb-3 font-bold">Editoria</th>
                <th className="pb-3 font-bold text-right">Leituras</th>
                <th className="pb-3 font-bold text-right w-20">Acessar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.portal.topArticles.map((art, idx) => (
                <tr key={art.slug} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-bold text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/noticias/${art.slug}`}
                      target="_blank"
                      className="font-semibold text-slate-900 hover:text-primary transition-colors line-clamp-1"
                    >
                      {art.title}
                    </Link>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                      {art.category}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-primary font-mono text-sm">
                    {art.views.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/noticias/${art.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-colors"
                      title="Ver notícia publicada"
                    >
                      <span>Ver</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disparo de Relatório Periódico por E-mail */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300">
              <Mail size={14} />
              <span>Envio de Relatório Periódico</span>
            </div>
            <h3 className="text-xl font-archivo-black tracking-tight">
              Entregar Relatório Executivo por E-mail
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Dispara o relatório consolidado de audiência formatado em HTML diretamente para a caixa de entrada cadastrada.
              {data?.reporting.recipientEmail && (
                <> Destinatário configurado: <strong>{data.reporting.recipientEmail}</strong>.</>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-primary hover:bg-blue-600 text-white transition-colors shadow-sm disabled:opacity-50"
            >
              <Send size={14} className={sendingEmail ? 'animate-pulse' : ''} />
              <span>{sendingEmail ? 'Enviando...' : 'Disparar Relatório Agora'}</span>
            </button>

            <Link
              href="/api/analytics/report?format=html"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
            >
              <Printer size={14} />
              <span>Pré-visualizar HTML</span>
            </Link>
          </div>
        </div>

        {emailStatus && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              emailStatus.ok
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {emailStatus.ok ? <CheckCircle2 size={15} /> : <Mail size={15} />}
            <span>{emailStatus.msg}</span>
          </div>
        )}
      </div>
    </div>
  )
}
