'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react'

interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: string | null
  authorName?: string | null
  featured: boolean
  published: boolean
  publishedAt: string
  category?: {
    id: string
    name: string
  } | null
  categories?: {
    id: string
    name: string
  }[]
}

interface CategoryOption {
  id: string
  name: string
}

export default function AdminPostsListPage() {
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  const fetchPosts = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (categoryFilter) params.append('categoryId', categoryFilter)

    fetch(`/api/admin/posts?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [search, categoryFilter])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o artigo:\n"${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id))
      } else {
        alert('Erro ao excluir artigo.')
      }
    } catch {
      alert('Erro de conexão ao excluir artigo.')
    }
  }

  const handleTogglePublish = async (post: PostListItem) => {
    try {
      const updatedStatus = !post.published
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: updatedStatus }),
      })
      if (res.ok) {
        setPosts(
          posts.map((p) => (p.id === post.id ? { ...p, published: updatedStatus } : p))
        )
      }
    } catch {
      alert('Erro ao atualizar status.')
    }
  }

  const handleToggleFeatured = async (post: PostListItem) => {
    try {
      const updatedFeatured = !post.featured
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: updatedFeatured }),
      })
      if (res.ok) {
        setPosts(
          posts.map((p) =>
            p.id === post.id
              ? { ...p, featured: updatedFeatured }
              : updatedFeatured
              ? { ...p, featured: false }
              : p
          )
        )
      }
    } catch {
      alert('Erro ao alterar destaque.')
    }
  }

  const filteredPosts = posts.filter((p) => {
    if (statusFilter === 'published') return p.published
    if (statusFilter === 'draft') return !p.published
    return true
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black">
            Notícias e Artigos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-archivo">
            Gerencie todas as publicações, matérias, manchetes e destaques do portal.
          </p>
        </div>

        <Link
          href="/admin/posts/novo"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow hover:shadow-md transition-all active:scale-95 shrink-0"
        >
          <PlusCircle size={16} />
          <span>Nova Notícia</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por título ou resumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
          >
            <option value="">Todas as Editorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-auto flex items-center border border-slate-300 rounded-lg overflow-hidden p-0.5 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded ${
              statusFilter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded ${
              statusFilter === 'published' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500'
            }`}
          >
            Publicados
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded ${
              statusFilter === 'draft' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            Rascunhos
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Carregando artigos...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-source-serif text-lg text-slate-600 mb-2">
              Nenhum artigo encontrado.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Experimente ajustar os filtros ou crie uma nova publicação.
            </p>
            <Link
              href="/admin/posts/novo"
              className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded"
            >
              Criar Primeiro Artigo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-archivo uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Artigo</th>
                  <th className="py-3 px-4">Editoria</th>
                  <th className="py-3 px-4 text-center">Destaque</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-archivo">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title + Excerpt */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="flex items-start gap-3">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-12 h-10 object-cover rounded bg-slate-100 shrink-0 hidden sm:block"
                          />
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="font-source-serif font-bold text-sm text-editorial-black hover:text-primary transition-colors block truncate"
                          >
                            {post.title}
                          </Link>
                          {post.excerpt && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categories */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[190px]">
                        {post.categories && post.categories.length > 0 ? (
                          post.categories.map((c) => (
                            <span
                              key={c.id}
                              className="font-bold text-[10px] text-primary uppercase bg-red-50 px-2 py-0.5 rounded whitespace-nowrap"
                            >
                              {c.name}
                            </span>
                          ))
                        ) : post.category ? (
                          <span className="font-bold text-[10px] text-primary uppercase bg-red-50 px-2 py-0.5 rounded whitespace-nowrap">
                            {post.category.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Sem editoria</span>
                        )}
                      </div>
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`p-1.5 rounded transition-colors ${
                          post.featured
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                        title={post.featured ? 'Remover do destaque de capa' : 'Promover a destaque de capa'}
                      >
                        <Star size={16} fill={post.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>

                    {/* Published toggle */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded transition-colors ${
                          post.published
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {post.published ? 'Publicado' : 'Rascunho'}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/noticia/${post.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-blue-royal rounded hover:bg-slate-100 transition-colors"
                          title="Ver no site"
                        >
                          <ExternalLink size={15} />
                        </Link>

                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-royal rounded hover:bg-blue-50 transition-colors"
                          title="Editar artigo"
                        >
                          <Edit size={15} />
                        </Link>

                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Excluir artigo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
