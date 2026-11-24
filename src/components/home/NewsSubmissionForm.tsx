'use client'

import { useState } from 'react'
import { Send, UploadCloud, CheckCircle2, AlertCircle, Phone } from 'lucide-react'

export default function NewsSubmissionForm() {
  const [form, setForm] = useState({
    name: '',
    contact: '',
    subject: '',
    message: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (selected.size > 25 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 20 MB.')
        return
      }
      setFile(selected)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')

    try {
      const data = new FormData()
      data.append('name', form.name)
      data.append('contact', form.contact)
      data.append('subject', form.subject)
      data.append('message', form.message)
      if (file) {
        data.append('file', file)
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        body: data,
      })

      if (!res.ok) {
        throw new Error('Falha ao enviar sugestão. Tente novamente.')
      }

      setStatus('success')
      setForm({ name: '', contact: '', subject: '', message: '' })
      setFile(null)
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Erro ao enviar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 border border-slate-300 rounded-lg p-6 sm:p-8">
      {/* Top Banner WhatsApp direct */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Phone size={20} />
          </div>
          <div>
            <h4 className="font-archivo-black text-xs sm:text-sm text-emerald-950 uppercase">
              Prefere enviar pelo WhatsApp?
            </h4>
            <p className="text-xs text-emerald-700">
              Canal direto com a redação: fotos, vídeos e relatos em tempo real.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/5511978098746?text=Ol%C3%A1!%20Quero%20enviar%20uma%20not%C3%ADcia%20para%20o%20Lavras%20Not%C3%ADcia."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded shadow-sm hover:shadow transition-all shrink-0"
        >
          <span>Abrir WhatsApp (11) 97809-8746</span>
        </a>
      </div>

      {/* Success notification */}
      {status === 'success' && (
        <div className="p-4 mb-6 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h5 className="font-bold text-sm">Notícia recebida com sucesso!</h5>
            <p className="text-xs mt-0.5 text-emerald-800">
              Obrigado pela sua colaboração com o bairro Lavras. Nossa redação irá checar as informações e você poderá ver a publicação em breve no portal.
            </p>
          </div>
        </div>
      )}

      {/* Error notification */}
      {status === 'error' && (
        <div className="p-4 mb-6 bg-rose-100 border border-rose-300 text-rose-900 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h5 className="font-bold text-sm">Ops, ocorreu um erro</h5>
            <p className="text-xs mt-0.5 text-rose-800">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-archivo font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              Seu Nome *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: João da Silva"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal focus:ring-1 focus:ring-blue-royal"
            />
          </div>

          <div>
            <label className="block text-xs font-archivo font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              E-mail ou Telefone *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: (11) 98765-4321 ou seu@email.com"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal focus:ring-1 focus:ring-blue-royal"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-archivo font-bold uppercase tracking-wide text-slate-700 mb-1.5">
            Assunto da Notícia *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Falta de iluminação na Rua das Acácias"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal focus:ring-1 focus:ring-blue-royal"
          />
        </div>

        <div>
          <label className="block text-xs font-archivo font-bold uppercase tracking-wide text-slate-700 mb-1.5">
            O que aconteceu? (Descreva com detalhes) *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Conte onde ocorreu, data aproximada, quem estava envolvido ou como afeta os moradores do bairro..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full text-sm px-3.5 py-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-blue-royal focus:ring-1 focus:ring-blue-royal resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-archivo font-bold uppercase tracking-wide text-slate-700 mb-1.5">
            Foto ou vídeo (opcional)
          </label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-white hover:border-blue-royal transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center">
              <UploadCloud size={24} className="text-slate-400 mb-1" />
              <p className="text-xs text-slate-600 font-medium">
                {file ? (
                  <span className="text-blue-royal font-bold">Arquivo anexado: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                ) : (
                  <span>Clique ou arraste um arquivo JPG, PNG, WebP, MP4, WebM ou MOV · até 20 MB</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-royal hover:bg-blue-royal-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wide px-8 py-3 rounded shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-60"
        >
          <Send size={15} />
          <span>{loading ? 'Enviando...' : 'Enviar notícia'}</span>
        </button>
      </form>
    </div>
  )
}
