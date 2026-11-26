'use client'

import { Suspense, useEffect, useRef } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import {
  isValidGaMeasurementId,
  isValidGtmId,
  classifyPortalContentGroup,
  trackAnalyticsEvent,
} from '@/lib/analytics-events'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function WebVitalsReporter({ enabled }: { enabled: boolean }) {
  const pathname = usePathname()

  useReportWebVitals((metric) => {
    if (!enabled || !pathname || pathname.startsWith('/admin')) return

    trackAnalyticsEvent(metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating || 'unknown',
      page_path: pathname,
      non_interaction: true,
    })
  })

  return null
}

function AnalyticsPageTracker({ gaId }: { gaId?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const scrollMilestonesRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    scrollMilestonesRef.current.clear()

    const query = searchParams?.toString()
    const url = query ? `${pathname}?${query}` : pathname

    trackAnalyticsEvent('page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      content_group: classifyPortalContentGroup(pathname),
      ...(gaId ? { send_to: gaId } : {}),
    })
  }, [pathname, searchParams, gaId])

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href') || ''
      if (!href) return

      if (href.includes('wa.me') || href.includes('api.whatsapp.com')) {
        trackAnalyticsEvent('whatsapp_click', {
          event_category: 'engagement',
          link_url: href,
          page_path: pathname,
        })
        return
      }

      if (href.startsWith('tel:')) {
        trackAnalyticsEvent('utility_call_click', {
          event_category: 'engagement',
          phone_number: href.replace('tel:', ''),
          page_path: pathname,
        })
        return
      }

      if (href.includes('instagram.com')) {
        trackAnalyticsEvent('social_click', {
          event_category: 'engagement',
          network: 'instagram',
          link_url: href,
          page_path: pathname,
        })
        return
      }

      if (anchor.closest('figure')) {
        trackAnalyticsEvent('ad_banner_click', {
          event_category: 'monetization',
          ad_url: href,
          page_path: pathname,
        })
      }
    }

    document.addEventListener('click', handleDocumentClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true })
    }
  }, [pathname])

  useEffect(() => {
    if (!pathname || !pathname.startsWith('/noticia/')) return

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const pct = Math.round((window.scrollY / docHeight) * 100)

      for (const milestone of [50, 90]) {
        if (pct >= milestone && !scrollMilestonesRef.current.has(milestone)) {
          scrollMilestonesRef.current.add(milestone)
          trackAnalyticsEvent('article_scroll_depth', {
            event_category: 'engagement',
            percent_scrolled: milestone,
            article_path: pathname,
            non_interaction: true,
          })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  return null
}

export function GoogleTagManagerNoScript({ gtmId }: { gtmId?: string }) {
  const cleanGtm = (gtmId || '').trim()
  if (!isValidGtmId(cleanGtm)) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(cleanGtm)}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}

export default function GoogleAnalytics({
  measurementId,
  gtmId,
}: {
  measurementId?: string
  gtmId?: string
}) {
  const gaId = (measurementId || '').trim()
  const cleanGtm = (gtmId || '').trim()
  const hasGa = isValidGaMeasurementId(gaId)
  const hasGtm = isValidGtmId(cleanGtm)

  if (!hasGa && !hasGtm) {
    return null
  }

  return (
    <>
      {hasGtm && (
        <Script id="google-tag-manager-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${cleanGtm}');
          `}
        </Script>
      )}

      {hasGa && (
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
              gtag('config', '${gaId}', {
                send_page_view: false,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });
            `}
          </Script>
        </>
      )}

      <WebVitalsReporter enabled={hasGa || hasGtm} />
      <Suspense fallback={null}>
        <AnalyticsPageTracker gaId={hasGa ? gaId : undefined} />
      </Suspense>
    </>
  )
}
