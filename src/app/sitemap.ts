import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/vagas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  try {
    const [categories, posts] = await Promise.all([
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { order: 'asc' },
      }),
      prisma.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
    ])

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${SITE_URL}/categoria/${cat.slug}`,
      lastModified: cat.updatedAt || now,
      changeFrequency: 'daily',
      priority: 0.8,
    }))

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/noticia/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || now,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

    return [...staticRoutes, ...categoryRoutes, ...postRoutes]
  } catch {
    return staticRoutes
  }
}
