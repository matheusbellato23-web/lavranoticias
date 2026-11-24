'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  List,
  Sparkles,
} from 'lucide-react'

interface CategoryOption {
  id: string
  name: string
  slug: string
}

interface PostEditorProps {
  initialData?: {
    id?: string
    title?: string
    slug?: string
    excerpt?: string | null
    content?: string
    coverImage?: string | null
    authorName?: string | null
    categoryId?: string | null
    featured?: boolean
    published?: boolean
  }
  isEditing?: boolean
}

export default function PostEditorForm({ initialData = {}, isEditing = false }: PostEditorProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const [title, setTitle] = useState(initialData.title || '')
  const [slug, setSlug] = useState(initialData.slug || '')
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '')
  const [content, setContent] = useState(initialData.content || '')
  const [coverImage, setCoverImage] = useState(initialData.coverImage || '')
  const [authorName, setAuthorName] = useState(initialData.authorName || 'Redação Lavras Notícia')
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '')
  const [featured, setFeatured] = useState(initialData.featured || false)
  const [published, setPublished] = useState(initialData.published ?? true)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
  }, [])

  // Auto-generate slug when title changes (if not explicitly edited)
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isEditing && !slug) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generated)
    }
  }

  // Formatting helpers for content
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textarea.value.substring(start, end)
    const replacement = `${prefix}${selected || 'texto'}${suffix}`

    const updated = textarea.value.substring(0, start) + replacement + textarea.value.substring(end)
    setContent(updated)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 5))
    }, 50)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        authorName,
        categoryId: categoryId || null,
        featured,
        published,
      }

      const url = isEditing ? `/api/admin/posts/${initialData.id}` : '/api/admin/posts'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar artigo.')
      }

      setSuccess('Artigo salvo com sucesso!')
      setTimeout(() => {
        router.push('/admin/posts')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar requisição.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-archivo-black text-2xl text-editorial-black">
              {isEditing ? 'Editar Notícia' : 'Nova Notícia'}
            </h1>
            <p className="text-xs text-slate-500 font-archivo">
              {isEditing ? 'Atualize as informações do artigo' : 'Escreva e publique uma matéria no Lavras Notícia'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? 'Salvando...' : 'Salvar Artigo'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Content, Excerpt, Toolbar */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Título da Matéria *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Nova unidade básica de saúde será inaugurada no bairro Lavras"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-base sm:text-lg font-source-serif font-bold px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal focus:ring-1 focus:ring-blue-royal"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-500 mb-1">
                Slug (URL amigável) *
              </label>
              <div className="flex items-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <span className="hidden sm:inline">lavrasnoticias.com.br/noticia/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="titulo-da-materia"
                  className="flex-1 bg-transparent text-slate-800 font-mono focus:outline-none ml-1 text-xs"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Resumo / Subtítulo (Lead Jornalístico)
              </label>
              <textarea
                rows={2}
                placeholder="Breve resumo da notícia que aparece nos cards da home e logo abaixo do título..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal resize-y"
              />
            </div>
          </div>

          {/* Content & Visual Toolbar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors ${
                    activeTab === 'edit'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
                    activeTab === 'preview'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Eye size={13} />
                  <span>Pré-visualização</span>
                </button>
              </div>

              {/* Formatting quick buttons */}
              {activeTab === 'edit' && (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertFormatting('<h2>', '</h2>')}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                    title="Subtítulo H2"
                  >
                    <Heading2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<h3>', '</h3>')}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                    title="Subtítulo H3"
                  >
                    <Heading3 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<strong>', '</strong>')}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                    title="Negrito"
                  >
                    <Bold size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<em>', '</em>')}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                    title="Itálico"
                  >
                    <Italic size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                    title="Citação"
                  >
                    <Quote size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<p>', '</p>')}
                    className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded"
                    title="Parágrafo"
                  >
                    P
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'edit' ? (
              <div>
                <textarea
                  id="post-content-textarea"
                  required
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva aqui o conteúdo da notícia. Você pode usar tags HTML como <p>, <h2>, <strong>, etc..."
                  className="w-full text-sm font-archivo text-slate-800 leading-relaxed p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal resize-y"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Dica: Quebre o texto em parágrafos com <code>&lt;p&gt;...&lt;/p&gt;</code> e intercale com subtítulos <code>&lt;h2&gt;...&lt;/h2&gt;</code> para leitura confortável.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg min-h-[300px]">
                <h2 className="font-source-serif font-bold text-2xl text-editorial-black mb-3">
                  {title || 'Título da Notícia'}
                </h2>
                {excerpt && (
                  <p className="text-slate-600 font-source-serif italic text-sm mb-4">
                    {excerpt}
                  </p>
                )}
                <div
                  className="font-archivo text-sm text-slate-800 leading-relaxed space-y-3 [&>p]:leading-relaxed [&>h2]:font-archivo-black [&>h2]:text-lg [&>h2]:mt-4 [&>h2]:mb-2 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-3 [&>blockquote]:italic"
                  dangerouslySetInnerHTML={{ __html: content || '<p className="text-slate-400 italic">O conteúdo aparecerá formatado aqui...</p>' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Publishing Settings */}
        <div className="space-y-5">
          {/* Publishing Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-archivo-black text-xs uppercase tracking-wider text-editorial-black border-b border-slate-100 pb-2">
              Publicação & Status
            </h3>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Editoria / Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-royal font-medium"
              >
                <option value="">Selecione uma editoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nome do Autor / Assinatura
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Redação Lavras Notícia"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal"
              />
            </div>

            {/* Featured toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <div>
                  <span className="font-bold text-xs text-editorial-black block">
                    ★ Destaque Principal na Capa (Hero)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Aparece no grande bloco superior com foto panorâmica da home page.
                  </span>
                </div>
              </label>
            </div>

            {/* Published toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-600"
                />
                <div>
                  <span className="font-bold text-xs text-editorial-black block">
                    Publicar imediatamente no site
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Se desmarcado, ficará salvo como rascunho invisível aos leitores.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Cover Image Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-archivo-black text-xs uppercase tracking-wider text-editorial-black border-b border-slate-100 pb-2">
              Imagem de Capa
            </h3>

            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                URL ou Caminho da Foto
              </label>
              <input
                type="text"
                placeholder="/assets/hero-bairro.jpg ou https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal"
              />
            </div>

            {/* Preview image */}
            {coverImage ? (
              <div className="rounded-lg overflow-hidden border border-slate-200 aspect-[16/10] bg-slate-100 relative">
                <img src={coverImage} alt="Capa" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                <ImageIcon className="mx-auto text-slate-300 mb-1" size={24} />
                <span>Nenhuma imagem informada</span>
              </div>
            )}

            {/* Quick presets */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Fotos locais e sugestões rápidas:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: 'Lavras Ônibus (Hero)', url: '/assets/hero-bairro.jpg' },
                  { name: 'Teatro Padre Bento', url: '/assets/noticia-documento-6.jpg' },
                  { name: 'Bienal do Livro', url: '/assets/noticia-documento-7.jpg' },
                  { name: 'Qualifica SP / CTMO', url: '/assets/noticia-documento-9.jpg' },
                  { name: 'Sesc Guarulhos', url: '/assets/noticia-documento-10.jpg' },
                ].map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverImage(preset.url)}
                    className="p-1 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 hover:bg-slate-100 truncate text-left"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
