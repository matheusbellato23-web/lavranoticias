import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
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
    return { title: 'Categoria não encontrada — Lavras Notícia' }
  }

  const desc = `Notícias de ${category.name} no Lavras Notícia, portal do bairro Lavras em Guarulhos.`
  return {
    title: `${category.name} — Lavras Notícia`,
    description: desc,
    openGraph: {
      title: `${category.name} — Lavras Notícia`,
      description: desc,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
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
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Topbar />
      <header className="border-b-4 border-foreground bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5">
          <Link
            href="/"
            aria-label="Lavras Notícia — página inicial"
            className="flex items-center gap-3"
          >
            <img
              src="/assets/logo-lavras.png"
              alt="Logo Lavras"
              className="h-14 w-auto"
            />
            <span className="font-display text-2xl uppercase sm:text-3xl text-foreground">
              Lavras <span className="text-accent">Notícia</span>
            </span>
          </Link>
        </div>
        <Navbar />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/"
          className="text-sm font-semibold text-accent hover:underline inline-block"
        >
          ← Voltar à capa
        </Link>
        <h1 className="mt-6 border-b-2 border-foreground pb-4 font-display text-3xl uppercase break-words md:text-4xl text-foreground">
          {category.name}
        </h1>

        {category.posts.length === 0 ? (
          <div className="min-h-64 border-b border-border py-16">
            <p className="font-serif text-xl text-muted-foreground">
              Nenhuma notícia publicada nesta categoria.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-10 py-8 md:grid-cols-2 lg:grid-cols-3">
            {category.posts.map((post) => (
              <article key={post.slug} className="min-w-0 border-b border-border pb-6">
                <Link href={`/noticia/${post.slug}`}>
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="mb-4 aspect-video w-full rounded object-cover"
                      loading="lazy"
                    />
                  )}
                  <h2 className="font-serif text-2xl font-bold leading-snug hover:text-primary transition-colors text-foreground">
                    {post.title}
                  </h2>
                </Link>
                {post.excerpt && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
