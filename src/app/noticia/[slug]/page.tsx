import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdBanner from '@/components/ui/AdBanner'
import PostCard from '@/components/ui/PostCard'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 30

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  })

  if (!post) {
    return { title: 'Notícia não encontrada – Lavras Notícia' }
  }

  return {
    title: `${post.title} – Lavras Notícia`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  })

  if (!post || !post.published) {
    notFound()
  }

  // Related posts (from the same category or latest)
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

  return (
    <>
      <Topbar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-archivo font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Voltar à capa</span>
          </Link>

          {post.category && (
            <Link
              href={`/categoria/${post.category.slug}`}
              className="text-xs font-archivo font-bold text-slate-500 hover:text-primary uppercase tracking-wider"
            >
              Editoria: {post.category.name}
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Main Article Column (2/3) */}
          <article className="lg:col-span-2">
            {/* Category Tag */}
            {post.category && (
              <div className="mb-3">
                <Link
                  href={`/categoria/${post.category.slug}`}
                  className="category-badge text-xs sm:text-sm"
                >
                  {post.category.name}
                </Link>
              </div>
            )}

            {/* Headline Title */}
            <h1 className="font-source-serif font-bold text-2xl sm:text-4xl lg:text-[40px] text-editorial-black leading-[1.15] mb-4">
              {post.title}
            </h1>

            {/* Subtitle / Lead */}
            {post.excerpt && (
              <p className="font-source-serif text-slate-600 text-base sm:text-lg leading-relaxed mb-6 font-normal">
                {post.excerpt}
              </p>
            )}

            {/* Meta Row: Author, Date, Share */}
            <div className="flex flex-wrap items-center justify-between py-3 border-y border-slate-200 text-xs text-slate-500 font-archivo mb-6 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <User size={13} className="text-primary" />
                  {post.authorName || 'Redação Lavras Notícia'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-[#25d366]/10 text-emerald-700 hover:bg-[#25d366] hover:text-white px-2.5 py-1 rounded transition-colors font-medium text-[11px]"
                >
                  <Share2 size={12} />
                  <span>Compartilhar</span>
                </a>
              </div>
            </div>

            {/* Featured Image */}
            {post.coverImage && (
              <figure className="mb-8">
                <div className="rounded overflow-hidden aspect-[16/10] bg-slate-100 shadow-sm">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="text-center text-[11px] text-slate-400 mt-2 font-archivo italic">
                  Foto / Divulgação · Lavras Notícia
                </figcaption>
              </figure>
            )}

            {/* Article Body HTML Content */}
            <div
              className="font-archivo text-base text-slate-800 leading-relaxed space-y-4 mb-8
                [&>p]:leading-relaxed [&>p]:text-slate-800
                [&>h2]:font-archivo-black [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:text-editorial-black [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:tracking-tight
                [&>h3]:font-archivo-black [&>h3]:text-lg [&>h3]:text-editorial-black [&>h3]:mt-6 [&>h3]:mb-2
                [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5
                [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5
                [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-700 [&>blockquote]:my-6
                [&>strong]:text-editorial-black
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Mid Article Ad */}
            <AdBanner position="mid" className="my-8" />

            {/* Back to Home Button */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-archivo font-bold text-primary hover:text-primary-dark transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Voltar à capa</span>
              </Link>

              <a
                href="#envie"
                className="text-xs font-bold text-blue-royal hover:underline"
              >
                Tem informações complementares? Envie para nós →
              </a>
            </div>
          </article>

          {/* Sidebar (1/3) */}
          <aside className="lg:col-span-1 space-y-8">
            <AdBanner position="sidebar" label="PUBLICIDADE" />

            {/* "Leia Também" Section */}
            <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
              <div className="border-b-2 border-editorial-black pb-2 mb-4">
                <h3 className="font-source-serif font-bold text-lg text-editorial-black">
                  Leia também
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {relatedPosts.map((rPost) => (
                  <PostCard key={rPost.id} post={rPost} variant="compact" />
                ))}
              </div>
            </div>

            {/* Envie Notícia Quick Box */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-5">
              <h4 className="font-archivo-black text-xs uppercase tracking-wider text-editorial-black mb-2">
                Envie sua Notícia
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Viu algo no bairro Lavras? Mande fotos, vídeos ou relatos para nossa redação comunitária.
              </p>
              <Link
                href="/#envie"
                className="block text-center bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase py-2.5 rounded transition-colors"
              >
                Acessar Formulário
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  )
}
