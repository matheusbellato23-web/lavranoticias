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
