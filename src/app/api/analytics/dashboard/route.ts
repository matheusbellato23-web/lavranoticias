import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSiteSeoSettings } from '@/lib/seo'
import { getAnalyticsIntegrationReadiness } from '@/lib/analytics-report'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const seo = await getSiteSeoSettings()
    const readiness = getAnalyticsIntegrationReadiness(seo)

    // ---- Métricas do banco de dados ----
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      totalPosts,
      postsLast30,
      postsLast7,
      totalCategories,
      totalJobs,
      totalEvents,
      totalLeads,
      leadsLast30,
      topArticles,
      postsPerMonth,
      categoryCounts,
    ] = await Promise.all([
      // Total de artigos publicados
      prisma.post.count({ where: { published: true } }),
      // Artigos publicados nos últimos 30 dias
      prisma.post.count({
        where: { published: true, publishedAt: { gte: thirtyDaysAgo } },
      }),
      // Artigos publicados nos últimos 7 dias
      prisma.post.count({
        where: { published: true, publishedAt: { gte: sevenDaysAgo } },
      }),
      // Total de categorias
      prisma.category.count(),
      // Vagas publicadas
      prisma.job.count({ where: { published: true } }),
      // Eventos futuros
      prisma.event.count({ where: { published: true, date: { gte: now } } }),
      // Total de sugestões
      prisma.lead.count(),
      // Sugestões nos últimos 30 dias
      prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      // Top 10 artigos por visualizações
      prisma.post.findMany({
        where: { published: true },
        orderBy: { views: 'desc' },
        take: 10,
        select: {
          title: true,
          slug: true,
          views: true,
          publishedAt: true,
          category: { select: { name: true } },
        },
      }),
      // Artigos publicados por mês (últimos 6 meses)
      prisma.post.groupBy({
        by: ['publishedAt'],
        where: {
          published: true,
          publishedAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
        },
        _count: { id: true },
        orderBy: { publishedAt: 'asc' },
      }),
      // Artigos por categoria
      prisma.category.findMany({
        select: {
          name: true,
          _count: { select: { posts: { where: { published: true } } } },
        },
        orderBy: { posts: { _count: 'desc' } },
        take: 8,
      }),
    ])

    // Agrupa artigos por mês (YYYY-MM)
    const monthMap: Record<string, number> = {}
    for (const row of postsPerMonth) {
      if (!row.publishedAt) continue
      const key = row.publishedAt.toISOString().slice(0, 7) // YYYY-MM
      monthMap[key] = (monthMap[key] ?? 0) + (row._count?.id ?? 0)
    }

    // Gera array dos últimos 6 meses
    const monthsChart: Array<{ month: string; label: string; posts: number }> = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      monthsChart.push({ month: key, label, posts: monthMap[key] ?? 0 })
    }

    return NextResponse.json({
      ok: true,
      ga: {
        measurementId: seo.gaMeasurementId,
        propertyId: seo.gaPropertyId,
        readiness,
      },
      db: {
        totalPosts,
        postsLast30,
        postsLast7,
        totalCategories,
        totalJobs,
        totalEvents,
        totalLeads,
        leadsLast30,
        topArticles: topArticles.map((p) => ({
          title: p.title,
          slug: p.slug,
          views: p.views ?? 0,
          category: p.category?.name ?? '—',
          publishedAt: p.publishedAt?.toISOString() ?? '',
        })),
        monthsChart,
        categoryCounts: categoryCounts.map((c) => ({
          name: c.name,
          count: c._count.posts,
        })),
      },
    })
  } catch (err) {
    console.error('[analytics/dashboard]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
