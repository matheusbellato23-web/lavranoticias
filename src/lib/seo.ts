import { prisma } from './prisma'
import { SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from './constants'

export type ReportFrequency = 'biweekly' | 'monthly'

export interface SiteSeoSettings {
  gaMeasurementId: string
  gtmId: string
  googleSiteVerification: string
  defaultDescription: string
  defaultOgImage: string
  gaPropertyId: string
  reportRecipientEmail: string
  reportFrequency: ReportFrequency
  reportEnabled: boolean
  reportLastSentAt: string
  reportLastStatus: string
}

const SETTING_KEYS = [
  'ga_measurement_id',
  'gtm_id',
  'google_site_verification',
  'seo_default_description',
  'seo_default_og_image',
  'ga_property_id',
  'analytics_report_email',
  'analytics_report_frequency',
  'analytics_report_enabled',
  'analytics_report_last_sent_at',
  'analytics_report_last_status',
]

function normalizeFrequency(raw?: string | null): ReportFrequency {
  return raw?.trim().toLowerCase() === 'biweekly' ? 'biweekly' : 'monthly'
}

export async function getSiteSeoSettings(): Promise<SiteSeoSettings> {
  const envGaId =
    process.env.NEXT_PUBLIC_GA_ID?.trim() ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
    ''
  const envGtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || ''
  const envVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || ''
  const envPropertyId = process.env.GA4_PROPERTY_ID?.trim() || ''
  const envReportEmail = process.env.ANALYTICS_REPORT_EMAIL?.trim() || ''
  const envReportFreq = normalizeFrequency(process.env.ANALYTICS_REPORT_FREQUENCY)
  const envReportEnabled = process.env.ANALYTICS_REPORT_ENABLED === 'true'

  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: SETTING_KEYS,
        },
      },
    })

    const map = new Map(rows.map((r) => [r.key, r.value]))
    const rawFreq = map.get('analytics_report_frequency')
    const rawEnabled = map.get('analytics_report_enabled')

    return {
      gaMeasurementId: map.get('ga_measurement_id')?.trim() || envGaId,
      gtmId: map.get('gtm_id')?.trim() || envGtmId,
      googleSiteVerification: map.get('google_site_verification')?.trim() || envVerification,
      defaultDescription: map.get('seo_default_description')?.trim() || SITE_DESCRIPTION,
      defaultOgImage: map.get('seo_default_og_image')?.trim() || DEFAULT_OG_IMAGE,
      gaPropertyId: map.get('ga_property_id')?.trim() || envPropertyId,
      reportRecipientEmail: map.get('analytics_report_email')?.trim() || envReportEmail,
      reportFrequency: rawFreq ? normalizeFrequency(rawFreq) : envReportFreq,
      reportEnabled: rawEnabled !== undefined ? rawEnabled === 'true' : envReportEnabled,
      reportLastSentAt: map.get('analytics_report_last_sent_at')?.trim() || '',
      reportLastStatus: map.get('analytics_report_last_status')?.trim() || '',
    }
  } catch {
    return {
      gaMeasurementId: envGaId,
      gtmId: envGtmId,
      googleSiteVerification: envVerification,
      defaultDescription: SITE_DESCRIPTION,
      defaultOgImage: DEFAULT_OG_IMAGE,
      gaPropertyId: envPropertyId,
      reportRecipientEmail: envReportEmail,
      reportFrequency: envReportFreq,
      reportEnabled: envReportEnabled,
      reportLastSentAt: '',
      reportLastStatus: '',
    }
  }
}

export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
