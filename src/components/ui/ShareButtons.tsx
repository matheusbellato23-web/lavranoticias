'use client'

import { useState } from 'react'
import { Share2, Check, MessageCircle, Link2 } from 'lucide-react'

interface ShareButtonsProps {
  url: string
  title: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-border py-2.5 text-xs">
      <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground mr-1">
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        Compartilhar:
      </span>

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1 font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
        aria-label="Compartilhar no WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded border border-border bg-card px-2.5 py-1 font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
        aria-label="Compartilhar no Facebook"
      >
        Facebook
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded border border-border bg-card px-2.5 py-1 font-semibold text-foreground hover:bg-muted transition-colors"
        aria-label="Compartilhar no X"
      >
        X
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded border border-border bg-card px-2.5 py-1 font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
        aria-label="Compartilhar no LinkedIn"
      >
        LinkedIn
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span className="text-emerald-700">Copiado!</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Copiar link</span>
          </>
        )}
      </button>
    </div>
  )
}
