import { prisma } from '@/lib/prisma'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdBanner from '@/components/ui/AdBanner'
import NewsSubmissionForm from '@/components/home/NewsSubmissionForm'
import Link from 'next/link'
import { Briefcase, ArrowRight, MessageCircle, MapPin, Building2, CheckCircle2 } from 'lucide-react'
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  INSTAGRAM_URL,
  EMERGENCY_NUMBERS,
} from '@/lib/constants'

// Always fetch fresh posts/events/jobs from DB
export const dynamic = 'force-dynamic'

function InstagramMark({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export default async function HomePage() {
  const [recentPosts, events, jobs] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: { category: true, categories: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 24,
    }),
    prisma.event.findMany({
      where: { published: true },
      orderBy: { date: 'asc' },
      take: 3,
    }),
    prisma.job.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  const heroPost = recentPosts.find((p) => p.featured) || recentPosts[0] || null
  const remainingPosts = heroPost ? recentPosts.filter((p) => p.id !== heroPost.id) : recentPosts

  // Prioritize stories with images in sidebar "Últimas notícias", backfilling if fewer than 4 exist
  const photoRemaining = remainingPosts.filter((p) => Boolean(p.coverImage))
  const textRemaining = remainingPosts.filter((p) => !p.coverImage)
  const sidebarPosts = [...photoRemaining, ...textRemaining].slice(0, 4)

  const sidebarIds = new Set(sidebarPosts.map((p) => p.id))
  const manchetes = remainingPosts.filter((p) => !sidebarIds.has(p.id)).slice(0, 6)

  // Up to 4 real visual highlights for the "No Instagram" mosaic
  const instagramPosts = recentPosts.filter((p) => Boolean(p.coverImage)).slice(0, 4)

  const manchetesGridClass =
    manchetes.length === 1
      ? 'mt-5 grid gap-5 grid-cols-1'
      : manchetes.length === 2 || manchetes.length === 4
      ? 'mt-5 grid gap-5 md:grid-cols-2'
      : 'mt-5 grid gap-5 md:grid-cols-3'

  const instagramMosaicCols =
    instagramPosts.length <= 2
      ? 'grid-cols-2'
      : instagramPosts.length === 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-4'

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/assets/logo-lavras.png`,
        },
        sameAs: [INSTAGRAM_URL],
        areaServed: {
          '@type': 'Place',
          name: 'Lavras, Guarulhos - SP, Brasil',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: `${SITE_NAME} — ${SITE_TAGLINE}`,
        description: SITE_DESCRIPTION,
        inLanguage: 'pt-BR',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Topbar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-0 w-full flex-1">
        {/* Top Leaderboard / Billboard Ad (970x250 desktop / 728x90 tablet / 300x250 mobile) */}
        <AdBanner position="top" format="rotativo" />

        {/* HERO SECTION: 2 cols featured + 1 col Últimas Notícias (compact horizontal rows balanced with Hero) */}
        <section className="grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {heroPost && (
            <article className="lg:col-span-2 flex flex-col">
              <Link href={`/noticia/${heroPost.slug}`} className="block group">
                <img
                  src={heroPost.coverImage || '/assets/hero-bairro.jpg'}
                  alt={heroPost.title}
                  width={1600}
                  height={912}
                  loading="eager"
                  fetchPriority="high"
                  className="aspect-[16/9] w-full rounded object-cover shadow-sm group-hover:opacity-95 transition-opacity"
                />
              </Link>
              <div className="mt-4 flex-1 flex flex-col">
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                  Destaque · {heroPost.category?.name || 'Geral'}
                </span>
                <Link href={`/noticia/${heroPost.slug}`}>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight hover:text-primary md:text-4xl text-foreground">
                    {heroPost.title}
                  </h2>
                </Link>
                {heroPost.excerpt && (
                  <p className="mt-3 font-serif text-lg text-muted-foreground leading-relaxed line-clamp-4">
                    {heroPost.excerpt}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Por <strong className="text-foreground">{heroPost.authorName || 'Redação Lavras Notícias'}</strong> ·{' '}
                    {new Date(heroPost.publishedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <Link
                    href={`/noticia/${heroPost.slug}`}
                    className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    Ler matéria completa <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Aside: Últimas notícias compactas + Formato 300x250 perto da foto principal */}
          <aside className="flex flex-col justify-between gap-5">
            <div>
              <h3 className="border-b-2 border-foreground pb-2 font-display text-lg uppercase text-foreground">
                Últimas notícias
              </h3>
              <ul className="divide-y divide-border">
                {sidebarPosts.map((post) => (
                  <li key={post.id} className="py-3 first:pt-3">
                    <Link
                      href={`/noticia/${post.slug}`}
                      className="group flex items-start gap-3"
                    >
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          width={112}
                          height={74}
                          loading="eager"
                          className="h-[74px] w-28 shrink-0 rounded object-cover shadow-xs group-hover:opacity-90 transition-opacity"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent block truncate">
                          {post.category?.name || 'Geral'}
                        </span>
                        <h4 className="mt-0.5 font-serif text-[15px] font-bold leading-snug group-hover:text-primary text-foreground line-clamp-2">
                          {post.title}
                        </h4>
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Publicidade 300x250 posicionada próxima à foto principal */}
            <AdBanner position="sidebar" format="rectangle" label="Publicidade" />
          </aside>
        </section>

        {/* Mid Leaderboard Ad (diretamente abaixo do bloco com fotos e antes de Manchetes) */}
        <AdBanner position="mid" format="leaderboard" />

        {/* MANCHETES LOCAIS */}
        {manchetes.length > 0 && (
          <section className="mt-4">
            <div className="flex items-end justify-between border-b-2 border-foreground pb-2 gap-4">
              <h3 className="font-display text-lg uppercase text-foreground">
                Manchetes locais
              </h3>
              <Link
                href="/categoria/todas-as-noticias"
                className="text-xs sm:text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
              >
                Ver todas as notícias <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className={manchetesGridClass}>
              {manchetes.map((post) => (
                <article
                  key={post.id}
                  className="flex h-full flex-col justify-between rounded bg-card p-5 shadow-xs ring-1 ring-border/80 transition-shadow hover:shadow-sm"
                >
                  <div>
                    <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                      {post.category?.name || 'Geral'}
                    </span>
                    <Link href={`/noticia/${post.slug}`}>
                      <h4 className="mt-1.5 font-serif text-lg font-bold leading-snug hover:text-primary text-foreground line-clamp-3">
                        {post.title}
                      </h4>
                    </Link>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <Link href={`/noticia/${post.slug}`} className="font-semibold text-primary hover:underline">
                      Ler mais →
                    </Link>
                  </div>
                </article>
              ))}

              {/* Completa o 6º espaço quando houver exatamente 5 manchetes, evitando célula vazia */}
              {manchetes.length === 5 && (
                <div className="flex h-full flex-col justify-between rounded bg-slate-50 p-5 ring-1 ring-border/80">
                  <div>
                    <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-primary">
                      Navegue por editoria
                    </span>
                    <h4 className="mt-1.5 font-serif text-lg font-bold leading-snug text-foreground">
                      Mais notícias de Guarulhos e do Lavras
                    </h4>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[
                        { label: 'Bairro', href: '/categoria/bairro' },
                        { label: 'Prefeitura', href: '/categoria/prefeitura' },
                        { label: 'Trânsito', href: '/categoria/transito' },
                        { label: 'Obras', href: '/categoria/obras' },
                        { label: 'Segurança', href: '/categoria/seguranca' },
                        { label: 'Saúde', href: '/categoria/saude' },
                      ].map((chip) => (
                        <Link
                          key={chip.href}
                          href={chip.href}
                          className="rounded border border-border bg-white px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          {chip.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <Link
                      href="/categoria/todas-as-noticias"
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary hover:underline"
                    >
                      Abrir arquivo completo <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* AGENDA DO BAIRRO + UTILIDADE PÚBLICA + PUBLICIDADE */}
        <section className="mt-10 grid gap-6 md:grid-cols-3 items-stretch">
          {/* 1. Agenda do bairro */}
          <div className="rounded bg-card p-6 shadow-xs ring-1 ring-border flex flex-col">
            <h3 className="font-display text-lg uppercase text-foreground">Agenda do bairro</h3>
            {events.length > 0 ? (
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
                      <div className="w-14 shrink-0 rounded bg-primary py-1.5 text-center text-primary-foreground self-start">
                        <div className="font-display text-xl leading-none">{day}</div>
                        <div className="text-[10px] font-bold">{month}</div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug text-foreground">{ev.title}</p>
                        {ev.location && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{ev.location}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="mt-4 flex-1 flex flex-col justify-between text-sm text-muted-foreground">
                <p>Sem eventos agendados para os próximos dias. Acompanhe atualizações da comunidade.</p>
                <a href="#envie" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                  Sugerir evento para a agenda <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* 2. Utilidade pública */}
          <div className="rounded bg-card p-6 shadow-xs ring-1 ring-border flex flex-col">
            <h3 className="font-display text-lg uppercase text-foreground">Utilidade pública</h3>
            <ul className="mt-4 divide-y divide-border flex-1">
              {EMERGENCY_NUMBERS.map((item) => (
                <li key={item.num} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <a href={`tel:${item.num}`} className="font-display text-accent hover:underline shrink-0">
                    {item.num}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Card Publicidade Vertical 300x250 */}
          <div className="rounded bg-card p-4 shadow-xs ring-1 ring-border flex items-center justify-center">
            <AdBanner format="rectangle" position="sidebar" label="Publicidade" />
          </div>
        </section>

        {/* NO INSTAGRAM (Mosaico editorial nativo — sem iframe quebrado ou espaço vazio) */}
        <section className="mt-10">
          <div className="flex items-end justify-between border-b-2 border-foreground pb-2 gap-4">
            <h3 className="flex items-center gap-2 font-display text-lg uppercase text-foreground">
              <InstagramMark className="h-5 w-5 text-accent" /> No Instagram
            </h3>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-bold text-accent hover:underline shrink-0"
            >
              @lavras_noticias · Seguir
            </a>
          </div>

          <div className="mt-5 rounded-lg bg-card p-5 sm:p-6 shadow-xs ring-1 ring-border grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-4 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-foreground">
                <InstagramMark className="h-3.5 w-3.5 text-accent" />
                <span>@lavras_noticias</span>
              </div>
              <h4 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-foreground">
                Acompanhe o Lavras em tempo real
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Boletins rápidos, registros fotográficos enviados pelos moradores, trânsito e utilidade pública direto no seu feed.
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm hover:opacity-95 transition-opacity"
              >
                <InstagramMark className="h-4 w-4" />
                <span>Seguir no Instagram</span>
              </a>
            </div>

            {instagramPosts.length > 0 && (
              <div className={`lg:col-span-8 grid gap-3 ${instagramMosaicCols}`}>
                {instagramPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/noticia/${post.slug}`}
                    className="group relative aspect-square overflow-hidden rounded-md bg-slate-900 shadow-xs"
                  >
                    <img
                      src={post.coverImage!}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {post.category?.name || 'Geral'}
                    </span>
                    <p className="absolute bottom-2.5 left-2.5 right-2.5 text-xs font-semibold leading-snug text-white line-clamp-2">
                      {post.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* MURAL DE EMPREGOS + COMÉRCIO LOCAL (Grid unificado 2/3 + 1/3 sem áreas vazias) */}
        <section className="mt-10 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground pb-2">
              <h3 className="flex items-center gap-2.5 font-display text-lg uppercase text-foreground">
                <Briefcase className="h-5 w-5" /> Mural de empregos
              </h3>
              <Link
                className="text-xs sm:text-sm font-bold text-primary hover:underline inline-flex items-center gap-1"
                href="/vagas"
              >
                Ver vagas e anunciar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {jobs.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 flex-1">
                {jobs.slice(0, 4).map((job) => (
                  <Link
                    key={job.id}
                    href="/vagas"
                    className="flex flex-col justify-between rounded bg-card p-4 shadow-xs ring-1 ring-border hover:ring-primary/50 transition-all"
                  >
                    <div>
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {job.type}
                      </span>
                      <h4 className="mt-2 font-serif text-base font-bold leading-snug text-foreground line-clamp-2">
                        {job.title}
                      </h4>
                      <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5 font-medium text-foreground/80">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </p>
                        {job.location && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="mt-3 pt-2 border-t border-border/60 text-xs font-bold text-primary inline-flex items-center gap-1">
                      Ver detalhes da vaga <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}

                {(jobs.length === 1 || jobs.length === 3) && (
                  <Link
                    href="/vagas"
                    className="flex flex-col justify-between rounded bg-slate-50 p-4 ring-1 ring-border hover:ring-primary/50 transition-all"
                  >
                    <div>
                      <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        Para empresas locais
                      </span>
                      <h4 className="mt-2 font-serif text-base font-bold leading-snug text-foreground">
                        Está contratando no Lavras ou região?
                      </h4>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                        Publique sua vaga gratuitamente no mural do bairro e alcance candidatos próximos.
                      </p>
                    </div>
                    <span className="mt-3 pt-2 border-t border-border/60 text-xs font-bold text-primary inline-flex items-center gap-1">
                      Anunciar vaga grátis <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 flex-1">
                <div className="flex flex-col justify-between rounded bg-card p-5 shadow-xs ring-1 ring-border">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                      Oportunidades locais
                    </span>
                    <h4 className="mt-1.5 font-serif text-lg font-bold text-foreground">
                      Procurando emprego perto de casa?
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Confira vagas abertas em comércios, empresas, serviços e estabelecimentos do bairro Lavras e Guarulhos.
                    </p>
                  </div>
                  <Link
                    href="/vagas"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary hover:underline"
                  >
                    Acessar mural de vagas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="flex flex-col justify-between rounded bg-slate-50 p-5 ring-1 ring-border">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                      Divulgação gratuita
                    </span>
                    <h4 className="mt-1.5 font-serif text-lg font-bold text-foreground">
                      Comércio ou empresa contratando?
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Envie sua oportunidade para o nosso mural comunitário em poucos segundos e encontre profissionais do bairro.
                    </p>
                  </div>
                  <Link
                    href="/vagas"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary hover:underline"
                  >
                    Publicar vaga grátis <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 flex flex-col">
            <h3 className="border-b-2 border-foreground pb-2 font-display text-lg uppercase text-foreground">
              Comércio local
            </h3>
            <div className="mt-5 flex-1 rounded bg-card p-4 shadow-xs ring-1 ring-border flex flex-col items-center justify-center">
              <AdBanner format="rectangle" position="sidebar" label="Publicidade" />
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Apoie os serviços e anunciantes de Guarulhos.
              </p>
            </div>
          </div>
        </section>

        {/* ENVIE SUA NOTÍCIA */}
        <section id="envie" className="mt-10 scroll-mt-4 border-t-4 border-foreground pt-8 pb-2">
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-2xl uppercase md:text-3xl text-foreground">
                  Envie sua notícia
                </h3>
                <p className="mt-3 font-serif text-lg text-muted-foreground leading-relaxed">
                  Viu algo acontecendo no bairro? Tem uma reclamação, demanda de zeladoria ou boa história? Toda pauta passa por apuração da nossa equipe antes da publicação.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <h4 className="font-display text-xs uppercase tracking-wider text-foreground">
                  Como funciona a participação
                </h4>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">1. Relate o fato:</strong> descreva o ocorrido com rua ou ponto de referência e anexe fotos ou vídeos.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">2. Checagem jornalística:</strong> nossa redação confirma os dados e preserva seu contato sob sigilo quando solicitado.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">3. Destaque no bairro:</strong> a pauta aprovada é publicada no portal e compartilhada com os moradores.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-950">
                    Prefere enviar pelo WhatsApp?
                  </p>
                  <p className="text-sm font-semibold text-emerald-800">(11) 97809-8746</p>
                </div>
                <a
                  href="https://wa.me/5511978098746?text=Ol%C3%A1!%20Quero%20enviar%20uma%20not%C3%ADcia%20para%20o%20Lavras%20Not%C3%ADcia."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold bg-[#25d366] hover:bg-[#20ba59] text-white shadow-sm rounded-md px-4 py-2.5 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
                </a>
              </div>
            </div>

            <div className="min-w-0">
              <NewsSubmissionForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
