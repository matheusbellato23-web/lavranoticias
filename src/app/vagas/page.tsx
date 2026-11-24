'use client'

import { useState, useEffect } from 'react'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdBanner from '@/components/ui/AdBanner'
import Link from 'next/link'
import {
  ArrowLeft,
  Briefcase,
  Search,
  PlusCircle,
  Building2,
  MapPin,
  Calendar,
  Send,
  X,
  ExternalLink,
} from 'lucide-react'

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

const JOB_TYPES = ['CLT', 'Temporário', 'Estágio', 'Autônomo', 'PJ', 'Aprendiz']

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
        }, 2000)
      }
    } catch (err) {
      alert('Erro ao enviar vaga. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Topbar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-archivo font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Voltar à capa</span>
          </Link>

          <span className="text-xs font-archivo text-slate-500 font-semibold">
            Lavras · Guarulhos
          </span>
        </div>

        {/* Section Header */}
        <div className="editorial-border pb-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-archivo-black text-3xl sm:text-5xl uppercase tracking-tight text-editorial-black">
                Mural de Empregos
              </h1>
              <p className="font-source-serif text-slate-600 text-sm sm:text-base mt-1">
                Conectando trabalhadores e oportunidades no bairro Lavras e região metropolitana.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center gap-2 bg-blue-royal hover:bg-blue-royal-dark text-white text-xs sm:text-sm font-archivo font-bold uppercase tracking-wider px-5 py-3 rounded shadow transition-all active:scale-95 shrink-0"
            >
              {showForm ? <X size={16} /> : <PlusCircle size={16} />}
              <span>{showForm ? 'Fechar formulário' : 'Envie sua vaga'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Form: "+ Envie sua vaga" */}
        {showForm && (
          <div className="mb-8 p-6 sm:p-8 bg-blue-50/50 border-2 border-blue-royal/30 rounded-xl shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-blue-200 pb-3">
              <h2 className="font-archivo-black text-base sm:text-lg text-blue-royal uppercase">
                Cadastrar Nova Oportunidade
              </h2>
              <span className="text-xs text-slate-500">Divulgação gratuita para empresas e comércios</span>
            </div>

            {formSuccess && (
              <div className="mb-4 p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-bold text-sm">
                ✅ Vaga cadastrada com sucesso e publicada no mural!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-archivo font-bold uppercase text-slate-700 mb-1">
                    Cargo / Função *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Atendente de Balcão, Auxiliar de Estoque"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-archivo font-bold uppercase text-slate-700 mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Padaria Lavras, Auto Peças Guarulhos"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-archivo font-bold uppercase text-slate-700 mb-1">
                    Local de Trabalho
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Lavras, Guarulhos – SP"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-archivo font-bold uppercase text-slate-700 mb-1">
                    Tipo de Contratação *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
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
                <label className="block text-xs font-archivo font-bold uppercase text-slate-700 mb-1">
                  Descrição, requisitos e benefícios *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva as tarefas diárias, horário de trabalho, requisitos (ex: escolaridade, experiência) e benefícios..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-archivo font-bold uppercase text-slate-700 mb-1">
                  E-mail ou WhatsApp para candidaturas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: https://wa.me/5511999999999 ou rh@empresa.com.br"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-blue-royal hover:bg-blue-royal-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded transition-all active:scale-95 disabled:opacity-50"
              >
                <Send size={15} />
                <span>{submitting ? 'Publicando...' : 'Publicar vaga no mural'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Search & Filters Bar */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por cargo, empresa ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-auto text-sm px-3 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal"
            >
              <option value="">Todos os tipos de contrato</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaderboard Ad */}
        <AdBanner position="top" className="my-6" />

        {/* Jobs List Grid (2-columns) */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-royal border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Carregando oportunidades...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-lg my-6">
            <Briefcase size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-source-serif text-lg text-slate-700">
              Nenhuma vaga encontrada com os filtros selecionados.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tente buscar por termos mais genéricos ou cadastre uma nova vaga.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const whatsappUrl = job.contact.startsWith('http')
                ? job.contact
                : job.contact.includes('@')
                ? `mailto:${job.contact}?subject=${encodeURIComponent(`Candidatura: ${job.title}`)}`
                : `https://wa.me/55${job.contact.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá, vi a vaga de ${job.title} no Lavras Notícia e gostaria de me candidatar.`
                  )}`

              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-blue-royal transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-archivo font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-royal border border-blue-200">
                        {job.type}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-archivo">
                        <Calendar size={11} />
                        {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h2 className="font-source-serif font-bold text-lg sm:text-xl text-editorial-black leading-tight">
                      {job.title}
                    </h2>

                    <div className="mt-2 space-y-1 text-xs text-slate-600 font-archivo">
                      <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building2 size={13} className="text-blue-royal" />
                        <span>{job.company}</span>
                      </p>
                      {job.location && (
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <MapPin size={13} className="text-red-500" />
                          <span>{job.location}</span>
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 font-archivo mt-3 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-archivo">
                      Vaga verificada
                    </span>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-blue-royal hover:bg-blue-royal-dark text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-all active:scale-95"
                    >
                      <span>Candidatar-se</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-slate-200">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-archivo font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Voltar à capa</span>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
