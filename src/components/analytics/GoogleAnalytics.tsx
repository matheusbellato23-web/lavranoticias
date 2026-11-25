'use client'

import { Suspense, useEffect } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const VALID_GA_ID = /^(G|GT|AW|DC)-[A-Z0-9-]+$/i

function AnalyticsPageTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    const query = searchParams?.toString()
    const url = query ? `${pathname}?${query}` : pathname

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
        send_to: gaId,
      })
    }
  }, [pathname, searchParams, gaId])

  return null
}

export default function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const gaId = (measurementId || '').trim()
  if (!gaId || !VALID_GA_ID.test(gaId)) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsPageTracker gaId={gaId} />
      </Suspense>
    </>
  )
}
