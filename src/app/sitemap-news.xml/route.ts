import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import { escapeXml } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    })

    const urlEntries = posts
      .map((post) => {
        const pubDate = new Date(post.publishedAt).toISOString()
        const keywords = post.category?.name
          ? `<news:keywords>${escapeXml(post.category.name)}, Lavras, Guarulhos</news:keywords>`
          : '<news:keywords>Lavras, Guarulhos, Notícias</news:keywords>'

        return `  <url>
    <loc>${escapeXml(`${SITE_URL}/noticia/${post.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
      ${keywords}
    </news:news>
  </url>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    })
  } catch (error) {
    console.error('News sitemap error:', error)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      }
    )
  }
}
