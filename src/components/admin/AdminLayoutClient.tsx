'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderTree,
  Briefcase,
  Calendar,
  Inbox,
  Megaphone,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Newspaper,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
  { label: 'Todos os Artigos', href: '/admin/posts', icon: FileText },
  { label: 'Novo Artigo', href: '/admin/posts/novo', icon: PlusCircle },
  { label: 'Categorias', href: '/admin/categories', icon: FolderTree },
  { label: 'Vagas de Emprego', href: '/admin/jobs', icon: Briefcase },
  { label: 'Agenda do Bairro', href: '/admin/events', icon: Calendar },
  { label: 'Sugestões dos Leitores', href: '/admin/leads', icon: Inbox },
  { label: 'Publicidade / Banners', href: '/admin/ads', icon: Megaphone },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isLoginPage = pathname === '/admin/login'

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (e) {
      router.push('/admin/login')
    }
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-archivo-black text-lg text-white">LAVRAS</span>
          <span className="font-archivo-black text-lg text-primary">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                LN
              </div>
              <div>
                <div className="flex items-baseline leading-none">
                  <span className="font-archivo-black text-base text-white">LAVRAS</span>
                  <span className="font-archivo-black text-base text-primary ml-1">PAINEL</span>
                </div>
                <span className="text-[10px] text-slate-400 font-archivo">Gestor Editorial</span>
              </div>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-archivo font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Newspaper size={15} />
              <span>Ver Site Público</span>
            </span>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors text-left"
          >
            <LogOut size={15} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <div className="hidden md:flex items-center justify-between bg-white border-b border-slate-200 px-8 py-3.5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Painel de Notícias e Publicações
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-700 font-bold">
              Lavras · Guarulhos/SP
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-royal hover:underline"
            >
              <span>Abrir Portal</span>
              <ExternalLink size={12} />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Page Inner Content */}
        <div className="p-4 sm:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
