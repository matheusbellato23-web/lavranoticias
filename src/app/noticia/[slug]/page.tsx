import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdBanner from '@/components/ui/AdBanner'
import { formatArticleHtml } from '@/lib/formatArticleHtml'
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/constants'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { category: true, categories: true },
  })

  if (!post || !post.published) {
    return {
      title: 'Notícia indisponível — Lavras Notícia',
      robots: { index: false, follow: false },
    }
  }

  const canonicalUrl = `${SITE_URL}/noticia/${post.slug}`
  const rawImage = post.coverImage || DEFAULT_OG_IMAGE
  const ogImage = rawImage.startsWith('http') ? rawImage : `${SITE_URL}${rawImage}`
  const description = post.excerpt || post.title

  return {
    title: `${post.title} — ${SITE_NAME}`,
    description,
    keywords: [
      post.category?.name || 'Notícias',
      'Lavras',
      'Guarulhos',
      SITE_NAME,
    ],
    alternates: {
      canonical: `/noticia/${post.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${post.title} — ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'article',
      publishedTime: new Date(post.publishedAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: [post.authorName || `Redação ${SITE_NAME}`],
      section: post.category?.name || 'Geral',
      images: [
        {
          url: ogImage,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { category: true, categories: true },
  })

  if (!post || !post.published) {
    notFound()
  }

  // Related posts
  const relatedPosts = await prisma.post.findMany({
    where: {
      published: true,
      NOT: { id: post.id },
    },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 4,
  })

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const rawContent = post.content || post.excerpt || ''
  const formattedHtml = formatArticleHtml(rawContent)
  const canonicalUrl = `${SITE_URL}/noticia/${post.slug}`
  const rawImg = post.coverImage || DEFAULT_OG_IMAGE
  const articleImgUrl = rawImg.startsWith('http') ? rawImg : `${SITE_URL}${rawImg}`

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: post.title,
        description: post.excerpt || post.title,
        image: [articleImgUrl],
        datePublished: new Date(post.publishedAt).toISOString(),
        dateModified: new Date(post.updatedAt).toISOString(),
        articleSection: post.category?.name || 'Geral',
        inLanguage: 'pt-BR',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        author: {
          '@type': 'Person',
          name: post.authorName || `Redação ${SITE_NAME}`,
        },
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/assets/logo-lavras.png`,
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Início',
            item: SITE_URL,
          },
          ...(post.category
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: post.category.name,
                  item: `${SITE_URL}/categoria/${post.category.slug}`,
                },
              ]
            : []),
          {
            '@type': 'ListItem',
            position: post.category ? 3 : 2,
            name: post.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Topbar />
      <header className="border-b-4 border-foreground bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link href="/" className="font-display text-3xl uppercase text-foreground">
            Lavras <span className="text-accent">Notícia</span>
          </Link>
        </div>
        <Navbar />
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            {post.categories && post.categories.length > 0 ? (
              post.categories.map((cat, idx) => (
                <span key={cat.id} className="inline-flex items-center gap-2">
                  {idx > 0 && <span className="text-muted-foreground text-xs">·</span>}
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="text-[11px] font-bold uppercase text-accent hover:underline"
                  >
                    {cat.name}
                  </Link>
                </span>
              ))
            ) : post.category ? (
              <Link
                href={`/categoria/${post.category.slug}`}
                className="text-[11px] font-bold uppercase text-accent hover:underline"
              >
                {post.category.name}
              </Link>
            ) : (
              <span className="text-[11px] font-bold uppercase text-accent">Geral</span>
            )}
          </div>

          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight md:text-4xl text-foreground">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-3 font-serif text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            Redação Lavras Notícia · {formattedDate}
          </p>

          {post.coverImage && (
            <div className="mt-6 space-y-3">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full rounded object-cover aspect-[16/10]"
                loading="eager"
              />
              {/* Publicidade rotativa colada diretamente embaixo da foto da matéria */}
              <AdBanner position="content" format="leaderboard" label="PUBLICIDADE" />
            </div>
          )}

          {/* Texto contínuo da matéria justificado e com suporte completo a formatação, links, cores, fotos e vídeos */}
          <div
            className="mt-6 space-y-4 font-serif text-lg leading-relaxed text-justify text-foreground [&>p]:leading-relaxed [&>h2]:font-display [&>h2]:text-2xl [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:text-left [&>h3]:font-serif [&>h3]:font-bold [&>h3]:text-xl [&>h3]:mt-6 [&>h3]:mb-2 [&>h3]:text-left [&>h4]:font-serif [&>h4]:font-bold [&>h4]:text-lg [&>h4]:mt-4 [&>h4]:mb-1.5 [&>h4]:text-left [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80 [&_mark]:px-1 [&_mark]:rounded [&_img]:w-full [&_img]:rounded [&_img]:my-4 [&_video]:w-full [&_video]:rounded [&_video]:my-4 [&_video]:bg-black [&_video]:max-h-[540px] [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded [&_iframe]:border-0 [&_hr]:my-6 [&_hr]:border-border"
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />

          <Link
            href="/"
            className="mt-8 inline-block font-bold text-accent hover:underline"
          >
            ← Voltar à capa
          </Link>
        </article>

        <aside className="space-y-8">
          <AdBanner position="sidebar" label="PUBLICIDADE" />

          <div>
            <h2 className="border-b-2 border-foreground pb-2 font-display text-lg uppercase text-foreground">
              Leia também
            </h2>
            <ul className="divide-y divide-border">
              {relatedPosts.map((r) => (
                <li key={r.slug} className="py-3">
                  <Link
                    href={`/noticia/${r.slug}`}
                    className="font-serif font-semibold hover:text-primary transition-colors text-foreground"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  )
}
