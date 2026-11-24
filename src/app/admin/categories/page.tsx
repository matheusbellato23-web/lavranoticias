'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Trash2, FolderTree, ExternalLink, Edit2, Check, X } from 'lucide-react'
import Link from 'next/link'

interface CategoryItem {
  id: string
  name: string
  slug: string
  order: number
  _count?: {
    posts: number
  }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')

  const fetchCategories = () => {
    setLoading(true)
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, slug: newSlug }),
      })
      if (res.ok) {
        setNewName('')
        setNewSlug('')
        fetchCategories()
      } else {
        const err = await res.json()
        alert(err.error || 'Erro ao criar categoria')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditSlug(cat.slug)
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, slug: editSlug }),
      })
      if (res.ok) {
        setEditingId(null)
        fetchCategories()
      } else {
        alert('Erro ao atualizar categoria')
      }
    } catch {
      alert('Erro de conexão')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir a categoria "${name}"? Os artigos associados não serão apagados.`)) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id))
      } else {
        alert('Erro ao excluir')
      }
    } catch {
      alert('Erro de conexão')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black">
          Editorias e Categorias
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-archivo">
          Gerencie as seções do menu de navegação e organize os artigos do portal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add Category */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-archivo-black text-sm uppercase tracking-wide text-editorial-black mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <PlusCircle size={16} className="text-primary" />
              Adicionar Nova Categoria
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nome da Editoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Meio Ambiente"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]+/g, '-')
                      )
                    }
                  }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal"
                />
              </div>

              <div>
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  placeholder="meio-ambiente"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-royal hover:bg-blue-royal-dark text-white font-archivo font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Adicionar Editoria'}
              </button>
            </form>
          </div>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-archivo-black text-sm uppercase text-editorial-black">
                Editorias Cadastradas ({categories.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Carregando...</div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-archivo uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4 text-center">Artigos</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-archivo">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-editorial-black">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-blue-royal focus:outline-none"
                          />
                        ) : (
                          cat.name
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-blue-royal focus:outline-none font-mono"
                          />
                        ) : (
                          `/categoria/${cat.slug}`
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-xs">
                          {cat._count?.posts ?? 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {editingId === cat.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(cat.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Salvar"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/categoria/${cat.slug}`}
                                target="_blank"
                                className="p-1.5 text-slate-400 hover:text-blue-royal rounded"
                                title="Visualizar página"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <button
                                onClick={() => handleStartEdit(cat)}
                                className="p-1.5 text-slate-400 hover:text-blue-royal rounded"
                                title="Editar"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
