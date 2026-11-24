'use client'

import { useState, useEffect } from 'react'
import { Inbox, Trash2, CheckCircle, FileText, Download, Phone, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LeadItem {
  id: string
  name: string
  contact: string
  subject: string
  message: string
  fileUrl?: string | null
  status: string
  createdAt: string
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = () => {
    setLoading(true)
    fetch('/api/admin/leads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLeads(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleToggleStatus = async (lead: LeadItem) => {
    const nextStatus = lead.status === 'LIDO' ? 'NOVO' : 'LIDO'
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setLeads(leads.map((l) => (l.id === lead.id ? { ...l, status: nextStatus } : l)))
      }
    } catch {
      alert('Erro ao atualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta mensagem de leitor?')) return
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLeads(leads.filter((l) => l.id !== id))
      }
    } catch {
      alert('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-archivo-black text-2xl sm:text-3xl text-editorial-black">
          Sugestões e Denúncias dos Leitores
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-archivo">
          Mensagens enviadas pela comunidade através da seção "Envie sua Notícia" na capa do portal.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Carregando sugestões...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Inbox size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-source-serif text-base text-slate-600">
              Nenhuma sugestão recebida até o momento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const isUnread = lead.status === 'NOVO'

              return (
                <div
                  key={lead.id}
                  className={`p-6 transition-colors ${isUnread ? 'bg-blue-50/20' : 'bg-white'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isUnread
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {lead.status}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-editorial-black">
                        {lead.subject}
                      </h3>
                    </div>

                    <span className="text-xs text-slate-400 font-archivo">
                      {new Date(lead.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 font-archivo leading-relaxed whitespace-pre-line mb-3">
                    {lead.message}
                  </p>

                  {/* Attached file if exists */}
                  {lead.fileUrl && (
                    <div className="mb-4 p-2.5 bg-slate-100 border border-slate-200 rounded-lg inline-flex items-center gap-2 text-xs text-slate-700">
                      <Download size={14} className="text-blue-royal" />
                      <span>Arquivo anexado pelo morador:</span>
                      <a
                        href={lead.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-royal hover:underline"
                      >
                        Baixar / Visualizar mídia
                      </a>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3 text-slate-600 font-medium">
                      <span>👤 {lead.name}</span>
                      <span>·</span>
                      <span className="text-blue-royal font-semibold">📞 {lead.contact}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(lead)}
                        className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
                      >
                        {isUnread ? 'Marcar como Lido' : 'Marcar como Não Lido'}
                      </button>

                      <Link
                        href={`/admin/posts/novo?leadId=${lead.id}&subject=${encodeURIComponent(
                          lead.subject
                        )}&content=${encodeURIComponent(lead.message)}`}
                        className="inline-flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded font-bold text-xs transition-colors"
                      >
                        <FileText size={13} />
                        <span>Transformar em Notícia</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
