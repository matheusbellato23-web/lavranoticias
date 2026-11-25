'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatArticleHtml } from '@/lib/formatArticleHtml'
import RichTextEditor from './RichTextEditor'
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Loader2,
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
    categoryIds?: string[]
    featured?: boolean
    published?: boolean
  }
  isEditing?: boolean
}

export default function PostEditorForm({ initialData = {}, isEditing = false }: PostEditorProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData.slug))

  const [title, setTitle] = useState(initialData.title || '')
  const [slug, setSlug] = useState(initialData.slug || '')
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '')
  const [content, setContent] = useState(initialData.content || '')
  const [coverImage, setCoverImage] = useState(initialData.coverImage || '')
  const [authorName, setAuthorName] = useState(initialData.authorName || 'Redação Lavras Notícia')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData.categoryIds && initialData.categoryIds.length > 0
      ? initialData.categoryIds
      : initialData.categoryId
      ? [initialData.categoryId]
      : []
  )
  const [featured, setFeatured] = useState(initialData.featured || false)
  const [published, setPublished] = useState(initialData.published ?? true)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data: CategoryOption[]) => {
        if (Array.isArray(data)) {
          setCategories(data)
          if (!isEditing) {
            const todas = data.find((c) => c.slug === 'todas-as-noticias')
            if (todas) {
              setSelectedCategoryIds((prev) =>
                prev.length === 0 ? [todas.id] : prev
              )
            }
          }
        }
      })
      .catch(() => {})
  }, [isEditing])

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Auto-generate slug when title changes (if not manually edited)
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isEditing && !slugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generated)
    }
  }

  const handleCoverImageUpload = async (file: File | undefined) => {
    if (!file) return
    setUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        setCoverImage(data.url)
      } else {
        alert(data.error || 'Erro ao enviar imagem de capa')
      }
    } catch {
      alert('Erro de conexão ao enviar foto de capa')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const plainTextCheck = content.replace(/<[^>]+>/g, '').trim()
    const hasMedia = /<(img|video|iframe)\b/i.test(content)
    if (!plainTextCheck && !hasMedia) {
      setError('Escreva o conteúdo ou adicione mídia antes de salvar.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const thematicId = selectedCategoryIds.find((id) => {
        const cat = categories.find((c) => c.id === id)
        return cat && cat.slug !== 'todas-as-noticias'
      })
      const payload = {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        authorName,
        categoryId: thematicId || selectedCategoryIds[0] || null,
        categoryIds: selectedCategoryIds,
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
                <span className="hidden sm:inline">lavrasnoticias.com/noticia/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true)
                    setSlug(e.target.value)
                  }}
                  placeholder="titulo-da-materia"
                  className="flex-1 bg-transparent text-slate-800 font-mono focus:outline-none ml-1 text-xs"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Resumo Curto / Subtítulo (1 a 3 linhas na capa)
              </label>
              <textarea
                rows={2}
                placeholder="Escreva apenas 1 ou 2 frases de resumo (o texto completo da matéria vai abaixo no Editor Visual)..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal resize-y"
              />
            </div>
          </div>

          {/* Visual Rich Text Editor & Preview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
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
                  Editor Visual
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
                  <span>Pré-visualização no Site</span>
                </button>
              </div>
              <span className="hidden sm:inline text-[11px] text-slate-500 font-medium">
                Use os botões <strong>Adicionar Foto</strong> e <strong>Adicionar Vídeo</strong> na barra abaixo para inserir no texto
              </span>
            </div>

            {activeTab === 'edit' ? (
              <RichTextEditor value={content} onChange={setContent} />
            ) : (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg min-h-[380px]">
                <h2 className="font-source-serif font-bold text-2xl text-editorial-black mb-3">
                  {title || 'Título da Notícia'}
                </h2>
                {excerpt && (
                  <p className="text-slate-600 font-source-serif italic text-sm mb-4">
                    {excerpt}
                  </p>
                )}
                <div
                  className="article-prose"
                  dangerouslySetInnerHTML={{
                    __html: content
                      ? formatArticleHtml(content)
                      : '<p class="text-slate-400 italic">O conteúdo aparecerá formatado aqui...</p>',
                  }}
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

            {/* Multi-Category Checkboxes (estilo WordPress) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700">
                  Editorias / Categorias *
                </label>
                <span className="text-[10px] font-semibold text-primary">
                  {selectedCategoryIds.length} selecionada(s)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Marque <strong>Todas as Notícias</strong> + o tema da matéria (pode escolher mais de uma).
              </p>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-1.5">
                {categories.map((c) => {
                  const checked = selectedCategoryIds.includes(c.id)
                  const isMaster = c.slug === 'todas-as-noticias'
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                        checked
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-white text-slate-700 font-medium'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(c.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span>{c.name}</span>
                      {isMaster && (
                        <span className="ml-auto text-[9px] uppercase bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                          Geral
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
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
                    ★ Destaque Principal na Capa (Foto Grande)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Coloca esta matéria na foto grande do topo (e move o destaque anterior para Últimas Notícias).
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
              Foto de Capa (Card / Destaque)
            </h3>

            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Enviar Foto de Capa
              </label>
              <label className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg bg-slate-50 border border-dashed border-slate-300 hover:border-primary hover:text-primary px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors mb-3">
                {uploadingCover ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Enviando capa...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Selecionar foto do computador</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingCover}
                  onChange={(e) => {
                    handleCoverImageUpload(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>

              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-500 mb-1">
                Ou cole a URL / Caminho
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
