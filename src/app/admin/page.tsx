import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Eye,
  Inbox,
  Briefcase,
  Calendar,
  PlusCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalJobs,
    totalEvents,
    totalLeads,
    recentPosts,
    recentLeads,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.job.count({ where: { published: true } }),
    prisma.event.count({ where: { published: true } }),
    prisma.lead.count(),
    prisma.post.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Painel de Controle
          </span>
          <h1 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black mt-1">
            Olá, {admin.name || 'Editor'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-archivo mt-1">
            Gerencie notícias, publicações de capa, oportunidades de emprego e sugestões da comunidade de Lavras.
          </p>
        </div>

        <Link
          href="/admin/posts/novo"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-5 py-3 rounded-lg shadow hover:shadow-md transition-all active:scale-95 shrink-0"
        >
          <PlusCircle size={16} />
          <span>Escrever Nova Notícia</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Notícias
            </p>
            <h3 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black mt-1">
              {totalPosts}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">
              {publishedPosts} publicadas ({draftPosts} rascunhos)
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-red-50 text-primary flex items-center justify-center">
            <FileText size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sugestões Recebidas
            </p>
            <h3 className="font-archivo-black text-2xl sm:text-3xl text-blue-royal mt-1">
              {totalLeads}
            </h3>
            <span className="text-[11px] text-slate-500">
              Enviadas por moradores
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-royal flex items-center justify-center">
            <Inbox size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vagas no Mural
            </p>
            <h3 className="font-archivo-black text-2xl sm:text-3xl text-slate-800 mt-1">
              {totalJobs}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">
              Oportunidades ativas
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Eventos na Agenda
            </p>
            <h3 className="font-archivo-black text-2xl sm:text-3xl text-purple-700 mt-1">
              {totalEvents}
            </h3>
            <span className="text-[11px] text-purple-600 font-medium">
              Agenda comunitária
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Articles & Reader Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Articles (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="font-archivo-black text-base uppercase text-editorial-black">
                Últimos Artigos Publicados
              </h2>
              <p className="text-xs text-slate-500">
                Lista recente de matérias do portal
              </p>
            </div>

            <Link
              href="/admin/posts"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Gerenciar todos</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {post.category && (
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                        {post.category.name}
                      </span>
                    )}
                    {post.featured && (
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        ★ Destaque Capa
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        post.published
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>

                  <Link href={`/admin/posts/${post.id}`}>
                    <h3 className="font-source-serif font-bold text-sm sm:text-base text-editorial-black hover:text-primary transition-colors truncate">
                      {post.title}
                    </h3>
                  </Link>

                  <span className="text-[11px] text-slate-400 font-archivo">
                    Publicado em {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/noticia/${post.slug}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-blue-royal rounded hover:bg-slate-100 transition-colors"
                    title="Visualizar no site público"
                  >
                    <ExternalLink size={15} />
                  </Link>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-xs font-bold text-blue-royal hover:underline px-2.5 py-1 rounded bg-blue-50"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reader Submissions (1 col) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="font-archivo-black text-base uppercase text-editorial-black">
                Sugestões Recentes
              </h2>
              <p className="text-xs text-slate-500">Enviadas pelos leitores</p>
            </div>

            <Link
              href="/admin/leads"
              className="text-xs font-bold text-blue-royal hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              Nenhuma sugestão recebida ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-editorial-black truncate">
                      {lead.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="font-medium text-xs text-primary truncate mb-1">
                    {lead.subject}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {lead.message}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate">{lead.contact}</span>
                    <Link
                      href={`/admin/posts/novo?leadId=${lead.id}&subject=${encodeURIComponent(
                        lead.subject
                      )}&content=${encodeURIComponent(lead.message)}`}
                      className="text-primary font-bold hover:underline shrink-0"
                    >
                      Transformar em Artigo →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
