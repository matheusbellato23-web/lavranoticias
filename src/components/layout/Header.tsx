import Link from 'next/link'
import Navbar from './Navbar'
import { SITE_TAGLINE } from '@/lib/constants'

export default function Header() {
  return (
    <header className="border-b-4 border-foreground bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-6">
        <Link href="/" className="shrink-0">
          <img
            src="/assets/logo-lavras-v2.png"
            alt="Logo Lavras"
            width={80}
            height={80}
            className="h-20 w-auto"
          />
        </Link>
        <div>
          <Link href="/">
            <h1 className="font-display text-4xl uppercase leading-none tracking-tight md:text-6xl text-foreground">
              Lavras <span className="text-accent">Notícias</span>
            </h1>
          </Link>
          <p className="mt-2 font-serif text-lg italic text-muted-foreground">
            {SITE_TAGLINE}
          </p>
        </div>
        <a
          href="#envie"
          className="ml-auto hidden rounded bg-accent px-5 py-3 text-sm font-bold uppercase text-accent-foreground md:block hover:bg-accent/90 transition-colors"
        >
          Envie sua notícia
        </a>
      </div>
      <Navbar />
    </header>
  )
}
