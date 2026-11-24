'use client'

import { useState } from 'react'

interface AdItem {
  id: string
  title: string
  alt: string
  link?: string
  img970: string
  img728: string
  img300: string
}

const ROTATIVO_ADS: AdItem[] = [
  {
    id: 'formiguinha',
    title: 'Programa Formiguinha — Prefeitura de Guarulhos',
    alt: 'Programa Formiguinha — Nós ligamos os pontos! Novo transporte circular intrabairro de Guarulhos - Prefeitura de Guarulhos',
    link: 'https://www.guarulhos.sp.gov.br/',
    img970: '/assets/programa-formiguinha-970x250.jpg',
    img728: '/assets/programa-formiguinha-728x90.jpg',
    img300: '/assets/programa-formiguinha-300x250.jpg',
  },
]

interface AdBannerProps {
  label?: string
  position?: 'top' | 'mid' | 'content' | 'sidebar'
  format?: 'billboard' | 'leaderboard' | 'rectangle' | 'rotativo'
  className?: string
}

export default function AdBanner({
  label = 'Publicidade',
  position = 'top',
  format = 'rotativo',
  className = '',
}: AdBannerProps) {
  const [currentAdIndex] = useState(0)
  const ad = ROTATIVO_ADS[currentAdIndex] || ROTATIVO_ADS[0]

  // Spacing based on position
  const wrapperSpacing =
    position === 'top'
      ? 'mb-8'
      : position === 'content'
      ? 'my-3'
      : position === 'mid'
      ? 'my-8'
      : ''

  // 1. Rectangle 300x250 (Sidebar / Mobile / Compact)
  if (format === 'rectangle' || position === 'sidebar') {
    return (
      <figure className={`mx-auto w-full ${wrapperSpacing} ${className}`} style={{ maxWidth: '300px' }}>
        <figcaption className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </figcaption>
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block group overflow-hidden rounded shadow-sm hover:shadow-md transition-all"
        >
          <img
            src={ad.img300}
            alt={ad.alt}
            width={300}
            height={250}
            loading="lazy"
            className="h-auto w-full group-hover:opacity-95 transition-opacity"
          />
        </a>
      </figure>
    )
  }

  // 2. Fixed Leaderboard 728x90
  if (format === 'leaderboard') {
    return (
      <div className={`w-full ${wrapperSpacing} ${className}`}>
        {/* Desktop / Tablet 728x90 */}
        <div className="hidden md:block">
          <figure className="mx-auto w-full" style={{ maxWidth: '728px' }}>
            <figcaption className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {label}
            </figcaption>
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group overflow-hidden rounded shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={ad.img728}
                alt={ad.alt}
                width={728}
                height={90}
                loading="lazy"
                className="h-auto w-full group-hover:opacity-95 transition-opacity"
              />
            </a>
          </figure>
        </div>

        {/* Mobile 300x250 */}
        <div className="md:hidden">
          <figure className="mx-auto w-full" style={{ maxWidth: '300px' }}>
            <figcaption className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {label}
            </figcaption>
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group overflow-hidden rounded shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={ad.img300}
                alt={ad.alt}
                width={300}
                height={250}
                loading="lazy"
                className="h-auto w-full group-hover:opacity-95 transition-opacity"
              />
            </a>
          </figure>
        </div>
      </div>
    )
  }

  // 3. Rotativo Completo (970x250 Desktop Largo / 728x90 Tablet / 300x250 Mobile)
  return (
    <div className={`w-full ${wrapperSpacing} ${className}`}>
      {/* Billboard Desktop Grande: 970x250 (em telas >= 1024px) */}
      <div className="hidden lg:block">
        <figure className="mx-auto w-full" style={{ maxWidth: '970px' }}>
          <figcaption className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </figcaption>
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group overflow-hidden rounded shadow-sm hover:shadow-md transition-all"
          >
            <img
              src={ad.img970}
              alt={ad.alt}
              width={970}
              height={250}
              loading="lazy"
              className="h-auto w-full group-hover:opacity-95 transition-opacity"
            />
          </a>
        </figure>
      </div>

      {/* Leaderboard Tablet / Desktop Médio: 728x90 (768px a 1023px) */}
      <div className="hidden md:block lg:hidden">
        <figure className="mx-auto w-full" style={{ maxWidth: '728px' }}>
          <figcaption className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </figcaption>
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group overflow-hidden rounded shadow-sm hover:shadow-md transition-all"
          >
            <img
              src={ad.img728}
              alt={ad.alt}
              width={728}
              height={90}
              loading="lazy"
              className="h-auto w-full group-hover:opacity-95 transition-opacity"
            />
          </a>
        </figure>
      </div>

      {/* Retângulo Mobile: 300x250 (< 768px) */}
      <div className="md:hidden">
        <figure className="mx-auto w-full" style={{ maxWidth: '300px' }}>
          <figcaption className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </figcaption>
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group overflow-hidden rounded shadow-sm hover:shadow-md transition-all"
          >
            <img
              src={ad.img300}
              alt={ad.alt}
              width={300}
              height={250}
              loading="lazy"
              className="h-auto w-full group-hover:opacity-95 transition-opacity"
            />
          </a>
        </figure>
      </div>
    </div>
  )
}
