'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, Briefcase, Building2, MapPin, Plus, Loader2 } from 'lucide-react'

interface JobItem {
  id: string
  title: string
  company: string
  location?: string | null
  type: string
  description: string
  contact: string
  createdAt: string
}

const JOB_TYPES = ['CLT', 'PJ', 'Temporário', 'Estágio', 'Autônomo', 'Aprendiz']

const inputClass =
  'mt-1 block w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export default function VagasPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: 'Lavras, Guarulhos – SP',
    type: 'CLT',
    description: '',
    contact: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchJobs = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (selectedType) params.append('type', selectedType)

    fetch(`/api/jobs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setJobs(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchJobs()
  }, [search, selectedType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setFormSuccess(true)
        setForm({
          title: '',
          company: '',
          location: 'Lavras, Guarulhos – SP',
          type: 'CLT',
          description: '',
          contact: '',
        })
        fetchJobs()
        setTimeout(() => {
          setShowForm(false)
          setFormSuccess(false)
        }, 3000)
      } else {
        const data = await res.json()
        setFormError(data.error || 'Erro ao enviar vaga. Verifique os campos.')
      }
    } catch (err) {
      setFormError('Erro de conexão ao enviar vaga.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(search.toLowerCase()))
    const matchType = !selectedType || job.type === selectedType
    return matchSearch && matchType
  })

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Topbar />
      <header className="border-b-4 border-foreground bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5">
          <Link
            href="/"
            aria-label="Lavras Notícia — página inicial"
            className="flex items-center gap-3"
          >
            <img
              src="/assets/logo-lavras.png"
              alt="Logo Lavras"
              className="h-14 w-auto"
            />
            <span className="font-display text-2xl uppercase sm:text-3xl text-foreground">
              Lavras <span className="text-accent">Notícia</span>
            </span>
          </Link>
        </div>
        <Navbar />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/"
          className="text-sm font-semibold text-accent hover:underline inline-block"
        >
          ← Voltar à capa
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-b-2 border-foreground pb-6">
          <div>
            <p className="mb-2 text-sm font-bold uppercase text-accent">Lavras · Guarulhos</p>
            <h1 className="font-display text-3xl uppercase md:text-4xl text-foreground">
              Mural de empregos
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm)
              setFormSuccess(false)
            }}
            className="inline-flex items-center gap-2 rounded bg-primary px-5 py-3 text-sm font-bold uppercase text-primary-foreground hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Fechar formulário' : 'Envie sua vaga'}
          </button>
        </div>

        {formSuccess && (
          <p
            role="status"
            className="mt-6 border-l-4 border-primary bg-primary/5 py-3 pl-4 font-semibold text-foreground"
          >
            Vaga publicada no mural!
          </p>
        )}

        {showForm && (
          <section className="border-b border-border py-8">
            <h2 className="font-serif text-2xl font-bold text-foreground">Envie sua vaga</h2>
            <form
              onSubmit={handleSubmit}
              aria-label="Envie sua vaga"
              className="mt-5 max-w-3xl space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-foreground">
                  Cargo
                  <input
                    name="title"
                    required
                    minLength={3}
                    maxLength={120}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-semibold text-foreground">
                  Empresa
                  <input
                    name="company"
                    required
                    minLength={2}
                    maxLength={120}
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-semibold text-foreground">
                  Local de trabalho
                  <input
                    name="location"
                    required
                    minLength={2}
                    maxLength={160}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-semibold text-foreground">
                  Contratação
                  <select
                    name="type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={inputClass}
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm font-semibold text-foreground">
                Descrição e requisitos
                <textarea
                  name="description"
                  rows={5}
                  required
                  minLength={20}
                  maxLength={5000}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-semibold text-foreground">
                E-mail ou WhatsApp para candidaturas
                <input
                  name="contact"
                  required
                  maxLength={255}
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className={inputClass}
                />
                <span className="mt-2 block text-xs font-normal text-muted-foreground">
                  Este contato será exibido publicamente na vaga.
                </span>
              </label>

              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded bg-primary px-5 py-3 text-sm font-bold uppercase text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publicando…
                  </>
                ) : (
                  'Publicar vaga'
                )}
              </button>
            </form>
          </section>
        )}

        {/* Busca e Filtro */}
        <div className="flex flex-wrap gap-4 border-b border-border py-6">
          <label className="relative flex-1 min-w-48">
            <span className="sr-only">Buscar vagas</span>
            <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={120}
              placeholder="Cargo, empresa ou local"
              className="h-11 w-full rounded border border-input bg-background pl-10 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <select
            aria-label="Filtrar contratação"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-11 rounded border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas as contratações</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Vagas */}
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-4 size-8 animate-spin" />
            <p>Carregando vagas…</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              {jobs.length ? 'Nenhuma vaga encontrada.' : 'Nenhuma vaga publicada ainda.'}
            </h2>
          </div>
        ) : (
          <div className="grid gap-x-8 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <article key={job.id} className="min-w-0 border-b border-border py-7">
                <p className="text-xs font-bold uppercase text-accent">{job.type}</p>
                <h2 className="mt-2 break-words font-serif text-2xl font-bold text-foreground">
                  {job.title}
                </h2>
                <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  {job.company}
                </p>
                {job.location && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    {job.location}
                  </p>
                )}
                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                  {job.description}
                </p>
                <p className="mt-4 break-all text-sm font-semibold text-primary">
                  Candidatar-se: {job.contact}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
