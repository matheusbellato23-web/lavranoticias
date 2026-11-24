import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-12 bg-foreground py-8 text-background">
      <div className="mx-auto max-w-6xl px-4 text-sm">
        <p className="font-display text-xl uppercase">Lavras Notícia</p>
        <p className="mt-1 opacity-75">
          Jornal digital comunitário e independente do bairro Lavras — Guarulhos, São Paulo.
        </p>
        <p className="mt-1 opacity-60">Não confundir com Lavras (MG).</p>

        {/* Publicidade 728x90 desktop */}
        <div className="mt-6 hidden md:block">
          <figure className="mx-auto w-full" style={{ maxWidth: '728px' }}>
            <figcaption className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Publicidade
            </figcaption>
            <img
              src="/assets/programa-formiguinha-728x90.jpg"
              alt="Programa Formiguinha — Nós ligamos os pontos!"
              width={728}
              height={90}
              loading="lazy"
              className="h-auto w-full"
            />
          </figure>
        </div>

        {/* Publicidade 300x250 mobile */}
        <div className="mt-6 md:hidden">
          <figure className="mx-auto w-full" style={{ maxWidth: '300px' }}>
            <figcaption className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Publicidade
            </figcaption>
            <img
              src="/assets/programa-formiguinha-300x250.jpg"
              alt="Programa Formiguinha — Nós ligamos os pontos!"
              width={300}
              height={250}
              loading="lazy"
              className="h-auto w-full rounded"
            />
          </figure>
        </div>

        {/* Bottom copyright and admin link */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-wrap justify-between items-center text-xs opacity-60 gap-2">
          <span>© {new Date().getFullYear()} Lavras Notícia · Todos os direitos reservados.</span>
          <Link href="/admin" className="hover:opacity-100 transition-opacity">
            Painel de Controle
          </Link>
        </div>
      </div>
    </footer>
  )
}
