'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Trash2, Briefcase, Building2, MapPin, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface JobItem {
  id: string
  title: string
  company: string
  location?: string | null
  type: string
  description: string
  contact: string
  published: boolean
  createdAt: string
}

const JOB_TYPES = ['CLT', 'Temporário', 'Estágio', 'Autônomo', 'PJ', 'Aprendiz']

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: 'Lavras, Guarulhos – SP',
    type: 'CLT',
    description: '',
    contact: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchJobs = () => {
    setLoading(true)
    fetch('/api/admin/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setJobs(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({
          title: '',
          company: '',
          location: 'Lavras, Guarulhos – SP',
          type: 'CLT',
          description: '',
          contact: '',
        })
        setShowAdd(false)
        fetchJobs()
      } else {
        alert('Erro ao cadastrar vaga')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublish = async (job: JobItem) => {
    try {
      const updated = !job.published
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: updated }),
      })
      if (res.ok) {
        setJobs(jobs.map((j) => (j.id === job.id ? { ...j, published: updated } : j)))
      }
    } catch {
      alert('Erro ao atualizar')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir a vaga "${title}"?`)) return
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== id))
      }
    } catch {
      alert('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black">
            Mural de Vagas e Empregos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-archivo">
            Gerencie as oportunidades de trabalho exibidas na seção da home e na página /vagas.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 bg-blue-royal hover:bg-blue-royal-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow transition-all active:scale-95 shrink-0"
        >
          <PlusCircle size={16} />
          <span>{showAdd ? 'Fechar Formulário' : 'Nova Oportunidade'}</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm">
          <h2 className="font-archivo-black text-base text-editorial-black uppercase mb-4 pb-2 border-b border-slate-100">
            Cadastrar Vaga
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cargo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Operador de Caixa"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal"
                />
              </div>

              <div>
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supermercado Lavras"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal"
                />
              </div>

              <div>
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tipo de Contrato
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                Descrição da Vaga *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detalhes sobre a vaga, requisitos e benefícios..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                Link de Contato ou WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="https://wa.me/5511999999999 ou email@empresa.com"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-royal"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-royal hover:bg-blue-royal-dark text-white font-archivo font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Salvar Vaga'}
            </button>
          </form>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Carregando vagas...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Nenhuma vaga cadastrada.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-royal">
                      {job.type}
                    </span>
                    <button
                      onClick={() => handleTogglePublish(job)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        job.published
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {job.published ? 'Ativa no Mural' : 'Oculta'}
                    </button>
                  </div>

                  <h3 className="font-source-serif font-bold text-base text-editorial-black">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-archivo mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Building2 size={13} />
                      {job.company}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-red-500" />
                        {job.location}
                      </span>
                    )}
                    <span>·</span>
                    <span>Criada em {new Date(job.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-archivo mt-2 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={job.contact}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-royal rounded hover:bg-slate-100"
                    title="Testar link de candidatura"
                  >
                    <ExternalLink size={16} />
                  </a>

                  <button
                    onClick={() => handleDelete(job.id, job.title)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    title="Excluir vaga"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
