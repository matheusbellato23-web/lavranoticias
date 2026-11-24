'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@lavrasnoticias.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao efetuar login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <div className="flex items-center justify-center gap-2">
              <span className="font-archivo-black text-3xl text-white">LAVRAS</span>
              <span className="font-archivo-black text-3xl text-primary">NOTÍCIA</span>
            </div>
          </Link>
          <h2 className="text-sm font-archivo text-slate-400">
            Painel de Gestão Editorial e Conteúdo
          </h2>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="font-archivo-black text-xl text-slate-900">
              Acesso Administrativo
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Informe suas credenciais para gerenciar notícias, vagas e agenda.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lavranoticias.com.br"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal focus:ring-1 focus:ring-blue-royal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal focus:ring-1 focus:ring-blue-royal"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
              💡 <strong>Credencial padrão pré-configurada:</strong><br/>
              E-mail: <code className="bg-slate-200 px-1 py-0.5 rounded">admin@lavrasnoticias.com</code><br/>
              Senha: <code className="bg-slate-200 px-1 py-0.5 rounded">admin123</code>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-royal hover:bg-blue-royal-dark text-white font-archivo font-bold text-sm uppercase tracking-wider py-3 rounded-lg shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao site público</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
