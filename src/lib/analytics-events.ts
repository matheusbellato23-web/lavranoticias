export const VALID_GA_ID_REGEX = /^(G|GT|AW|DC)-[A-Z0-9-]+$/i
export const VALID_GTM_ID_REGEX = /^GTM-[A-Z0-9]+$/i

export function isValidGaMeasurementId(value?: string | null): boolean {
  if (!value) return false
  return VALID_GA_ID_REGEX.test(value.trim())
}

export function isValidGtmId(value?: string | null): boolean {
  if (!value) return false
  return VALID_GTM_ID_REGEX.test(value.trim())
}

export function classifyPortalContentGroup(pathname: string): string {
  if (!pathname || pathname === '/') return 'capa'
  if (pathname.startsWith('/noticia/')) return 'materia'
  if (pathname.startsWith('/categoria/')) return 'editoria'
  if (pathname.startsWith('/vagas')) return 'empregos'
  return 'portal'
}

export function trackAnalyticsEvent(
  eventName: string,
  params: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === 'undefined') return
  if (window.location.pathname.startsWith('/admin')) return

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
    return
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...params })
  }
}
