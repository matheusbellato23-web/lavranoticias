import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'
import { getSiteSeoSettings } from '@/lib/seo'

function extractGoogleVerificationToken(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  // If user pasted the full <meta name="google-site-verification" content="..." /> tag, extract content
  const match = trimmed.match(/content=["']([^"']+)["']/i)
  return match ? match[1].trim() : trimmed
}

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const settings = await getSiteSeoSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const gaMeasurementId = String(body.gaMeasurementId || '').trim().toUpperCase()
    const googleSiteVerification = extractGoogleVerificationToken(
      String(body.googleSiteVerification || '')
    )
    const defaultDescription = String(body.defaultDescription || '').trim()
    const defaultOgImage = String(body.defaultOgImage || '').trim()

    if (gaMeasurementId && !/^(G|GT|AW|DC)-[A-Z0-9-]+$/i.test(gaMeasurementId)) {
      return NextResponse.json(
        { error: 'ID do Google Analytics inválido. Use o formato G-XXXXXXXXXX.' },
        { status: 400 }
      )
    }

    const pairs: { key: string; value: string }[] = [
      { key: 'ga_measurement_id', value: gaMeasurementId },
      { key: 'google_site_verification', value: googleSiteVerification },
      { key: 'seo_default_description', value: defaultDescription },
      { key: 'seo_default_og_image', value: defaultOgImage },
    ]

    for (const pair of pairs) {
      await prisma.siteSetting.upsert({
        where: { key: pair.key },
        update: { value: pair.value },
        create: { key: pair.key, value: pair.value },
      })
    }

    revalidatePath('/', 'layout')

    return NextResponse.json({
      success: true,
      settings: {
        gaMeasurementId,
        googleSiteVerification,
        defaultDescription,
        defaultOgImage,
      },
    })
  } catch (error) {
    console.error('Update SEO settings error:', error)
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 })
  }
}
