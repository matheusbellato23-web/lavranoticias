'use client'

import { useState, useEffect } from 'react'

interface AdItem {
  id: string
  title: string
  alt: string
  link?: string
  img970: string
  img728: string
  img300: string
}

interface ApiAdRecord {
  id: string
  title: string
  altText?: string | null
  linkUrl?: string | null
  img970?: string | null
  img728?: string | null
  img300?: string | null
  imageUrl?: string | null
}

const DEFAULT_AD: AdItem = {
  id: 'formiguinha',
  title: 'Programa Formiguinha — Prefeitura de Guarulhos',
  alt: 'Programa Formiguinha — Nós ligamos os pontos! Novo transporte circular intrabairro de Guarulhos - Prefeitura de Guarulhos',
  link: 'https://www.guarulhos.sp.gov.br/',
  img970: '/assets/programa-formiguinha-970x250.jpg',
  img728: '/assets/programa-formiguinha-728x90.jpg',
  img300: '/assets/programa-formiguinha-300x250.jpg',
}

interface AdBannerProps {
  label?: string
  position?: 'top' | 'mid' | 'content' | 'sidebar'
  format?: 'billboard' | 'leaderboard' | 'rectangle' | 'rotativo'
  className?: string
}

function AdSlotFigure({
  ad,
  src,
  width,
  height,
  label,
}: {
  ad: AdItem
  src: string
  width: number
  height: number
  label: string
}) {
  const imgElement = (
    <img
      src={src}
      alt={ad.alt}
      width={width}
      height={height}
      loading="lazy"
      className="h-auto w-full group-hover:opacity-95 transition-opacity"
    />
  )

  return (
    <figure className="mx-auto w-full" style={{ maxWidth: `${width}px` }}>
      <figcaption className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </figcaption>
      {ad.link ? (
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block group overflow-hidden rounded shadow-sm hover:shadow-md transition-all"
        >
          {imgElement}
        </a>
      ) : (
        <div className="block overflow-hidden rounded shadow-sm">{imgElement}</div>
      )}
    </figure>
  )
}

export default function AdBanner({
  label = 'Publicidade',
  position = 'top',
  format = 'rotativo',
  className = '',
}: AdBannerProps) {
  const [ads, setAds] = useState<AdItem[]>([DEFAULT_AD])
  const [loaded, setLoaded] = useState(false)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  useEffect(() => {
    let active = true
    fetch('/api/ads', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: ApiAdRecord[]) => {
        if (!active || !Array.isArray(data)) return
        const mapped = data
          .map((item): AdItem | null => {
            const fallback = item.img970 || item.img728 || item.img300 || item.imageUrl || ''
            if (!fallback) return null
            return {
              id: item.id,
              title: item.title,
              alt: item.altText || item.title,
              link: item.linkUrl || undefined,
              img970: item.img970 || item.img728 || fallback,
              img728: item.img728 || item.img970 || fallback,
              img300: item.img300 || fallback,
            }
          })
          .filter((x): x is AdItem => x !== null)

        setAds(mapped)
        setCurrentAdIndex(0)
        setLoaded(true)
      })
      .catch(() => {
        if (active) setLoaded(true)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (ads.length <= 1) return
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [ads.length])

  if (loaded && ads.length === 0) {
    return null
  }

  const ad = ads[currentAdIndex % ads.length] || DEFAULT_AD

  const wrapperSpacing =
    position === 'top'
      ? 'mb-8'
      : position === 'content'
      ? 'my-3'
      : position === 'mid'
      ? 'my-8'
      : ''

  if (format === 'rectangle' || position === 'sidebar') {
    return (
      <div className={`w-full ${wrapperSpacing} ${className}`}>
        <AdSlotFigure ad={ad} src={ad.img300} width={300} height={250} label={label} />
      </div>
    )
  }

  if (format === 'leaderboard') {
    return (
      <div className={`w-full ${wrapperSpacing} ${className}`}>
        <div className="hidden md:block">
          <AdSlotFigure ad={ad} src={ad.img728} width={728} height={90} label={label} />
        </div>
        <div className="md:hidden">
          <AdSlotFigure ad={ad} src={ad.img300} width={300} height={250} label={label} />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${wrapperSpacing} ${className}`}>
      <div className="hidden lg:block">
        <AdSlotFigure ad={ad} src={ad.img970} width={970} height={250} label={label} />
      </div>
      <div className="hidden md:block lg:hidden">
        <AdSlotFigure ad={ad} src={ad.img728} width={728} height={90} label={label} />
      </div>
      <div className="md:hidden">
        <AdSlotFigure ad={ad} src={ad.img300} width={300} height={250} label={label} />
      </div>
    </div>
  )
}
