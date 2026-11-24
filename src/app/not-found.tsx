import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Topbar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center w-full">
        <h1 className="font-archivo-black text-7xl sm:text-9xl text-primary tracking-tighter mb-2">
          404
        </h1>
        <h2 className="font-source-serif font-bold text-2xl sm:text-3xl text-editorial-black mb-3">
          Página não encontrada
        </h2>
        <p className="font-archivo text-slate-500 text-sm max-w-md mx-auto mb-8">
          A notícia ou página que você está procurando pode ter sido removida, alterada ou não existe.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-archivo font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded-lg shadow transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Voltar à capa do portal</span>
        </Link>
      </main>

      <Footer />
    </>
  )
}
