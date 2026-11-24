'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Trash2, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react'

interface EventItem {
  id: string
  title: string
  date: string
  location?: string | null
  description?: string | null
  published: boolean
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    location: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchEvents = () => {
    setLoading(true)
    fetch('/api/admin/events')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({
          title: '',
          date: new Date().toISOString().slice(0, 10),
          location: '',
          description: '',
        })
        setShowAdd(false)
        fetchEvents()
      } else {
        alert('Erro ao cadastrar evento')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir evento "${title}"?`)) return
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEvents(events.filter((e) => e.id !== id))
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
            Agenda Comunitária do Bairro
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-archivo">
            Cadastre reuniões, feiras, eventos esportivos e culturais exibidos na Trinca da capa.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow transition-all active:scale-95 shrink-0"
        >
          <PlusCircle size={16} />
          <span>{showAdd ? 'Fechar Formulário' : 'Novo Evento'}</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
          <h2 className="font-archivo-black text-base text-editorial-black uppercase mb-4 pb-2 border-b border-slate-100">
            Adicionar Evento na Agenda
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Feira de Artesanato e Gastronomia"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Data do Evento *
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                Local ou Ponto de Encontro
              </label>
              <input
                type="text"
                placeholder="Ex: Praça Central do Bairro Lavras"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-archivo font-bold uppercase tracking-wider text-slate-700 mb-1">
                Descrição ou Detalhes
              </label>
              <textarea
                rows={2}
                placeholder="Horário, atrações, se é gratuito, etc..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-purple-600 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-purple-700 hover:bg-purple-800 text-white font-archivo font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Cadastrar na Agenda'}
            </button>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Carregando eventos...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Nenhum evento agendado.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((ev) => {
              const d = new Date(ev.date)
              const day = String(d.getDate()).padStart(2, '0')
              const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()

              return (
                <div key={ev.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-lg bg-blue-royal text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="font-archivo-black text-lg leading-none">{day}</span>
                      <span className="text-[10px] font-bold uppercase leading-none mt-0.5 text-blue-200">
                        {month}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-source-serif font-bold text-base text-editorial-black truncate">
                        {ev.title}
                      </h3>
                      {ev.location && (
                        <p className="text-xs text-slate-500 font-archivo flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-primary" />
                          <span>{ev.location}</span>
                        </p>
                      )}
                      {ev.description && (
                        <p className="text-xs text-slate-600 font-archivo mt-1 line-clamp-1">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(ev.id, ev.title)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 shrink-0"
                    title="Excluir evento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
