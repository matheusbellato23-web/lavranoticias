import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdBanner from '@/components/ui/AdBanner'
import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 30

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  })

  if (!category) {
    return { title: 'Categoria não encontrada – Lavras Notícia' }
  }

  return {
    title: `${category.name} – Lavras Notícia`,
    description: `Notícias e acontecimentos sobre ${category.name} no bairro Lavras e região de Guarulhos/SP.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
      },
    },
  })

  if (!category) {
    notFound()
  }

  return (
    <>
      <Topbar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 w-full">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-archivo font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Voltar à capa</span>
          </Link>
        </div>

        {/* Category Header */}
        <div className="editorial-border pb-3 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="font-archivo-black text-3xl sm:text-5xl uppercase tracking-tight text-editorial-black">
              {category.name}
            </h1>
            <span className="text-xs font-archivo text-slate-500">
              {category.posts.length} {category.posts.length === 1 ? 'notícia publicada' : 'notícias publicadas'}
            </span>
          </div>
        </div>

        {/* Posts Feed */}
        {category.posts.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-lg my-8">
            <p className="font-source-serif text-lg text-slate-600 mb-2">
              Nenhuma notícia publicada nesta editoria ainda.
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Tem alguma novidade sobre {category.name} no bairro Lavras? Envie para nossa redação!
            </p>
            <Link
              href="/#envie"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded transition-colors"
            >
              Envie sua notícia
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feed Left (2/3) */}
            <div className="lg:col-span-2 divide-y divide-slate-200">
              {category.posts.map((post) => (
                <article key={post.id} className="py-6 first:pt-0 group">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {post.coverImage && (
                      <Link
                        href={`/noticia/${post.slug}`}
                        className="shrink-0 w-full sm:w-56 aspect-[16/10] rounded overflow-hidden bg-slate-100"
                      >
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>
                    )}

                    <div className="flex-1">
                      <Link href={`/noticia/${post.slug}`}>
                        <h2 className="font-source-serif font-bold text-xl sm:text-2xl text-editorial-black leading-tight group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                      </Link>

                      {post.excerpt && (
                        <p className="font-archivo text-slate-600 text-sm leading-relaxed mt-2 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 font-archivo">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        {post.authorName && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {post.authorName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Sidebar Right (1/3) */}
            <aside className="lg:col-span-1 space-y-6">
              <AdBanner position="sidebar" label="PUBLICIDADE" />

              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                <h3 className="font-archivo-black text-xs uppercase tracking-wider text-editorial-black mb-3 border-b border-slate-200 pb-2">
                  Participe de Lavras
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Envie fotos, denúncias e sugestões de pauta para nossa equipe comunitária.
                </p>
                <a
                  href="https://wa.me/5511978098746?text=Ol%C3%A1,%20quero%20enviar%20uma%20pauta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded transition-colors"
                >
                  WhatsApp da Redação
                </a>
              </div>
            </aside>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-slate-200">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-archivo font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Voltar à capa</span>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
