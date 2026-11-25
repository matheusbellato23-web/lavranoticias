'use client'

import { useState, useEffect } from 'react'
import {
  PlusCircle,
  Trash2,
  Pencil,
  Upload,
  ExternalLink,
  CheckCircle2,
  PauseCircle,
  Megaphone,
  Loader2,
  X,
} from 'lucide-react'

interface AdItem {
  id: string
  title: string
  altText?: string | null
  linkUrl?: string | null
  img970?: string | null
  img728?: string | null
  img300?: string | null
  active: boolean
  createdAt: string
}

interface AdFormState {
  title: string
  altText: string
  linkUrl: string
  img970: string
  img728: string
  img300: string
  active: boolean
}

const EMPTY_FORM: AdFormState = {
  title: '',
  altText: '',
  linkUrl: '',
  img970: '',
  img728: '',
  img300: '',
  active: true,
}

type FormatKey = 'img970' | 'img728' | 'img300'

const FORMAT_SPECS: { key: FormatKey; label: string; hint: string }[] = [
  { key: 'img970', label: 'Banner 970 × 250 px', hint: 'Desktop grande (topo)' },
  { key: 'img728', label: 'Banner 728 × 90 px', hint: 'Tablet e abaixo de fotos/matéria' },
  { key: 'img300', label: 'Banner 300 × 250 px', hint: 'Lateral e celular' },
]

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AdFormState>(EMPTY_FORM)
  const [uploadingField, setUploadingField] = useState<FormatKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchAds = () => {
    setLoading(true)
    fetch('/api/admin/ads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAds(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const openNewForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setFeedback('')
  }

  const openEditForm = (ad: AdItem) => {
    setEditingId(ad.id)
    setForm({
      title: ad.title,
      altText: ad.altText || '',
      linkUrl: ad.linkUrl || '',
      img970: ad.img970 || '',
      img728: ad.img728 || '',
      img300: ad.img300 || '',
      active: ad.active,
    })
    setShowForm(true)
    setFeedback('')
  }

  const handleFileUpload = async (field: FormatKey, file: File | undefined) => {
    if (!file) return
    setUploadingField(field)
    setFeedback('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'ads')
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, [field]: data.url }))
      } else {
        alert(data.error || 'Erro ao enviar imagem')
      }
    } catch {
      alert('Erro de conexão ao enviar imagem')
    } finally {
      setUploadingField(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback('')

    try {
      const url = editingId ? `/api/admin/ads/${editingId}` : '/api/admin/ads'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        setForm(EMPTY_FORM)
        setFeedback(editingId ? 'Campanha atualizada com sucesso!' : 'Campanha criada com sucesso!')
        fetchAds()
      } else {
        alert(data.error || 'Erro ao salvar campanha')
      }
    } catch {
      alert('Erro ao salvar campanha')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (ad: AdItem) => {
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !ad.active }),
      })
      if (res.ok) {
        setAds((prev) =>
          prev.map((item) => (item.id === ad.id ? { ...item, active: !ad.active } : item))
        )
      }
    } catch {
      alert('Erro ao alterar status')
    }
  }

  const handleDelete = async (ad: AdItem) => {
    if (!confirm(`Excluir a campanha "${ad.title}"?`)) return
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, { method: 'DELETE' })
      if (res.ok) {
        setAds((prev) => prev.filter((item) => item.id !== ad.id))
      }
    } catch {
      alert('Erro ao excluir campanha')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black">
            Publicidade & Banners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-archivo mt-1">
            Gerencie as campanhas rotativas nos 3 formatos padrão (970×250, 728×90 e 300×250). Todas as campanhas ativas alternam automaticamente no portal.
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-5 py-3 rounded-lg shadow transition-all shrink-0"
        >
          <PlusCircle size={16} />
          <span>Nova Campanha</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-archivo-black text-lg text-editorial-black">
              {editingId ? 'Editar Campanha' : 'Nova Campanha de Publicidade'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome da Campanha / Anunciante *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Programa Formiguinha — Prefeitura"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Link de Destino (ao clicar no banner)
              </label>
              <input
                type="url"
                placeholder="https://www.guarulhos.sp.gov.br/"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Texto Alternativo (Acessibilidade / Descrição)
            </label>
            <input
              type="text"
              placeholder="Descrição curta da campanha"
              value={form.altText}
              onChange={(e) => setForm({ ...form, altText: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-2">
            {FORMAT_SPECS.map((spec) => {
              const currentUrl = form[spec.key]
              const isUploading = uploadingField === spec.key
              return (
                <div
                  key={spec.key}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
                >
                  <div>
                    <p className="text-xs font-bold text-editorial-black uppercase">{spec.label}</p>
                    <p className="text-[11px] text-slate-500">{spec.hint}</p>
                  </div>

                  {currentUrl ? (
                    <div className="rounded border border-slate-200 bg-white p-2 flex items-center justify-center min-h-[90px]">
                      <img
                        src={currentUrl}
                        alt={spec.label}
                        className="max-h-28 w-auto object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="rounded border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-400 min-h-[90px] flex items-center justify-center">
                      Nenhuma imagem enviada
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg bg-white border border-slate-300 hover:border-primary hover:text-primary px-3 py-2 text-xs font-semibold text-slate-700 transition-colors">
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>{currentUrl ? 'Trocar imagem' : 'Subir imagem'}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(spec.key, e.target.files?.[0])}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Ou cole a URL da imagem"
                    value={currentUrl}
                    onChange={(e) => setForm({ ...form, [spec.key]: e.target.value })}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span>Campanha ativa (exibir no site)</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold uppercase text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingField !== null}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow disabled:opacity-60"
              >
                {submitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Publicar Campanha'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
          Carregando campanhas...
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <Megaphone className="mx-auto text-slate-300" size={40} />
          <p className="font-semibold text-slate-700">Nenhuma campanha cadastrada ainda.</p>
          <p className="text-xs text-slate-500">
            Clique em &ldquo;Nova Campanha&rdquo; para subir seus banners.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-archivo-black text-base sm:text-lg text-editorial-black">
                      {ad.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        ad.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ad.active ? (
                        <>
                          <CheckCircle2 size={12} /> Ativo
                        </>
                      ) : (
                        <>
                          <PauseCircle size={12} /> Pausado
                        </>
                      )}
                    </span>
                  </div>
                  {ad.linkUrl && (
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      <span>{ad.linkUrl}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(ad)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {ad.active ? 'Pausar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => openEditForm(ad)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(ad)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                {FORMAT_SPECS.map((spec) => {
                  const img = ad[spec.key]
                  return (
                    <div key={spec.key} className="rounded border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                        {spec.label}
                      </p>
                      {img ? (
                        <img
                          src={img}
                          alt={`${ad.title} - ${spec.label}`}
                          className="max-h-20 w-auto mx-auto object-contain rounded"
                        />
                      ) : (
                        <p className="text-[11px] text-slate-400 italic py-4 text-center">
                          Não enviado
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
