import { prisma } from '@/lib/prisma'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdBanner from '@/components/ui/AdBanner'
import NewsSubmissionForm from '@/components/home/NewsSubmissionForm'
import Link from 'next/link'
import { Briefcase, ArrowRight, MessageCircle } from 'lucide-react'

// Revalidate on server every 30 seconds
export const revalidate = 30

export default async function HomePage() {
  const [featuredPost, sidebarPosts, manchetes, events] = await Promise.all([
    // Hero post (Corrida Novembro Azul or latest featured)
    prisma.post.findFirst({
      where: { published: true, featured: true },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
    }),
    // 4 posts for the sidebar "Últimas notícias" (with images)
    prisma.post.findMany({
      where: { published: true, featured: false, coverImage: { not: null } },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    }),
    // Manchetes locais (without images)
    prisma.post.findMany({
      where: { published: true, featured: false, coverImage: null },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    }),
    // Events for "Agenda do bairro"
    prisma.event.findMany({
      where: { published: true },
      orderBy: { date: 'asc' },
      take: 3,
    }),
  ])

  // Fallback for featured post if needed
  const heroPost = featuredPost || (await prisma.post.findFirst({
    where: { published: true },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
  }))

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <Topbar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 w-full flex-1">
        {/* Top Leaderboard Ad with generous margin */}
        <AdBanner position="top" />

        {/* HERO SECTION: 2 cols featured + 1 col Últimas Notícias */}
        <section className="grid gap-8 lg:grid-cols-3">
          {heroPost && (
            <article className="lg:col-span-2">
              <Link href={`/noticia/${heroPost.slug}`}>
                <img
                  src={heroPost.coverImage || '/assets/hero-bairro.jpg'}
                  alt={heroPost.title}
                  width={1600}
                  height={912}
                  className="aspect-[16/9] w-full rounded object-cover shadow-sm"
                />
              </Link>
              <div className="mt-4">
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                  Destaque · {heroPost.category?.name || 'Geral'}
                </span>
                <Link href={`/noticia/${heroPost.slug}`}>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight hover:text-primary md:text-4xl text-foreground">
                    {heroPost.title}
                  </h2>
                </Link>
                {heroPost.excerpt && (
                  <p className="mt-3 font-serif text-lg text-muted-foreground leading-relaxed">
                    {heroPost.excerpt}
                  </p>
                )}
              </div>
            </article>
          )}

          {/* Aside: Últimas notícias */}
          <aside>
            <h3 className="border-b-2 border-foreground pb-2 font-display text-lg uppercase text-foreground">
              Últimas notícias
            </h3>
            <ul className="divide-y divide-border">
              {sidebarPosts.map((post) => (
                <li key={post.id} className="py-4">
                  {post.coverImage && (
                    <Link href={`/noticia/${post.slug}`}>
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        loading="lazy"
                        className="mb-2 aspect-[16/9] w-full rounded object-cover shadow-sm"
                      />
                    </Link>
                  )}
                  <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                    {post.category?.name || 'Geral'}
                  </span>
                  <Link
                    className="mt-1 block font-serif text-lg font-semibold leading-snug hover:text-primary text-foreground"
                    href={`/noticia/${post.slug}`}
                  >
                    {post.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        {/* Mid Leaderboard Ad */}
        <AdBanner position="mid" />

        {/* MANCHETES LOCAIS */}
        <section className="mt-6">
          <h3 className="border-b-2 border-foreground pb-2 font-display text-lg uppercase text-foreground">
            Manchetes locais
          </h3>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {manchetes.map((post) => (
              <article key={post.id} className="border-l-4 border-primary pl-4">
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                  {post.category?.name || 'Bairro'}
                </span>
                <Link href={`/noticia/${post.slug}`}>
                  <h4 className="mt-1 font-serif text-xl font-bold leading-snug hover:text-primary text-foreground">
                    {post.title}
                  </h4>
                </Link>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* AGENDA DO BAIRRO + UTILIDADE PÚBLICA + PUBLICIDADE */}
        <section className="mt-12 grid gap-8 md:grid-cols-3">
          {/* 1. Agenda do bairro */}
          <div className="rounded bg-card p-6 shadow-sm ring-1 ring-border">
            <h3 className="font-display text-lg uppercase text-foreground">Agenda do bairro</h3>
            <ul className="mt-4 space-y-4">
              {events.map((ev) => {
                const dateObj = new Date(ev.date)
                const day = String(dateObj.getDate()).padStart(2, '0')
                const month = dateObj
                  .toLocaleDateString('pt-BR', { month: 'short' })
                  .replace('.', '')
                  .toUpperCase()

                return (
                  <li key={ev.id} className="flex gap-4">
                    <div className="w-14 shrink-0 rounded bg-primary py-1 text-center text-primary-foreground">
                      <div className="font-display text-xl leading-none">{day}</div>
                      <div className="text-[10px] font-bold">{month}</div>
                    </div>
                    <div>
                      <p className="font-semibold leading-snug text-foreground">{ev.title}</p>
                      {ev.location && (
                        <p className="text-xs text-muted-foreground">{ev.location}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* 2. Utilidade pública */}
          <div className="rounded bg-card p-6 shadow-sm ring-1 ring-border">
            <h3 className="font-display text-lg uppercase text-foreground">Utilidade pública</h3>
            <ul className="mt-4 divide-y divide-border">
              {[
                { label: 'Polícia Militar', num: '190' },
                { label: 'Guarda Civil Municipal', num: '153' },
                { label: 'SAMU', num: '192' },
                { label: 'Bombeiros', num: '193' },
                { label: 'Prefeitura de Guarulhos', num: '156' },
              ].map((item) => (
                <li key={item.num} className="flex justify-between py-2 text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <a href={`tel:${item.num}`} className="font-display text-accent hover:underline">
                    {item.num}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Card Publicidade Vertical 300x250 */}
          <div className="flex items-center">
            <figure className="mx-auto w-full" style={{ maxWidth: '300px' }}>
              <figcaption className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Publicidade
              </figcaption>
              <img
                src="/assets/programa-formiguinha-300x250.jpg"
                alt="Programa Formiguinha — Nós ligamos os pontos!"
                width={300}
                height={250}
                loading="lazy"
                className="h-auto w-full rounded shadow-sm"
              />
            </figure>
          </div>
        </section>

        {/* NO INSTAGRAM */}
        <section className="mt-12">
          <div className="flex items-end justify-between border-b-2 border-foreground pb-2">
            <h3 className="font-display text-lg uppercase text-foreground">No Instagram</h3>
            <a
              href="https://www.instagram.com/lavras_noticias/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-accent hover:underline"
            >
              @lavras_noticias · Seguir
            </a>
          </div>
          <div className="mx-auto mt-6 max-w-xl overflow-hidden rounded ring-1 ring-border">
            <iframe
              src="https://www.instagram.com/lavras_noticias/embed"
              title="Feed do Instagram @lavras_noticias"
              className="h-[640px] w-full bg-card"
              loading="lazy"
            />
          </div>
        </section>

        {/* COMÉRCIO LOCAL */}
        <section className="mt-12">
          <h3 className="border-b-2 border-foreground pb-2 font-display text-lg uppercase text-foreground">
            Comércio local
          </h3>
          <div className="mt-6">
            <figure className="mx-auto w-full" style={{ maxWidth: '300px' }}>
              <figcaption className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Publicidade
              </figcaption>
              <img
                src="/assets/programa-formiguinha-300x250.jpg"
                alt="Programa Formiguinha — Nós ligamos os pontos!"
                width={300}
                height={250}
                loading="lazy"
                className="h-auto w-full rounded shadow-sm"
              />
            </figure>
          </div>
        </section>

        {/* MURAL DE EMPREGOS */}
        <section className="mt-12 border-y-2 border-foreground py-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <h3 className="flex items-center gap-3 font-display text-2xl uppercase text-foreground">
              <Briefcase className="h-6 w-6" /> Mural de empregos
            </h3>
            <Link
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 transition-colors text-foreground"
              href="/vagas"
            >
              Ver vagas e enviar sua vaga <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ENVIE SUA NOTÍCIA */}
        <section id="envie" className="mt-12 scroll-mt-4 border-y-4 border-foreground py-8">
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
            <div>
              <h3 className="font-display text-2xl uppercase md:text-3xl text-foreground">
                Envie sua notícia
              </h3>
              <p className="mt-3 font-serif text-lg text-muted-foreground">
                Viu algo acontecendo no bairro? Tem uma reclamação ou uma boa história? Toda informação passa por apuração da nossa equipe antes de ser publicada.
              </p>
              <a
                href="https://wa.me/5511978098746?text=Ol%C3%A1!%20Quero%20enviar%20uma%20not%C3%ADcia%20para%20o%20Lavras%20Not%C3%ADcia."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary-dark rounded-md mt-6 h-auto min-h-11 whitespace-normal px-5 py-3 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Enviar pelo WhatsApp
              </a>
              <p className="mt-2 text-sm text-muted-foreground">(11) 97809-8746</p>
            </div>

            <div className="min-w-0">
              <NewsSubmissionForm />
            </div>
          </div>
        </section>

        {/* Bottom Leaderboard Ad */}
        <AdBanner position="bottom" />
      </main>

      <Footer />
    </div>
  )
}
