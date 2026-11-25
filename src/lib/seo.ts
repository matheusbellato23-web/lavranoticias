import { prisma } from './prisma'
import { SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from './constants'

export interface SiteSeoSettings {
  gaMeasurementId: string
  googleSiteVerification: string
  defaultDescription: string
  defaultOgImage: string
}

export async function getSiteSeoSettings(): Promise<SiteSeoSettings> {
  const envGaId = process.env.NEXT_PUBLIC_GA_ID || ''
  const envVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || ''

  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            'ga_measurement_id',
            'google_site_verification',
            'seo_default_description',
            'seo_default_og_image',
          ],
        },
      },
    })

    const map = new Map(rows.map((r) => [r.key, r.value]))
    return {
      gaMeasurementId: map.get('ga_measurement_id')?.trim() || envGaId,
      googleSiteVerification: map.get('google_site_verification')?.trim() || envVerification,
      defaultDescription: map.get('seo_default_description')?.trim() || SITE_DESCRIPTION,
      defaultOgImage: map.get('seo_default_og_image')?.trim() || DEFAULT_OG_IMAGE,
    }
  } catch {
    return {
      gaMeasurementId: envGaId,
      googleSiteVerification: envVerification,
      defaultDescription: SITE_DESCRIPTION,
      defaultOgImage: DEFAULT_OG_IMAGE,
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
