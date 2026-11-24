import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const ads = await prisma.ad.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(ads)
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { title, altText, linkUrl, img970, img728, img300, active } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'O título da campanha é obrigatório' }, { status: 400 })
    }

    if (!img970 && !img728 && !img300) {
      return NextResponse.json(
        { error: 'Envie ao menos uma arte de banner (970x250, 728x90 ou 300x250)' },
        { status: 400 }
      )
    }

    const ad = await prisma.ad.create({
      data: {
        title: title.trim(),
        altText: altText?.trim() || title.trim(),
        linkUrl: linkUrl?.trim() || null,
        img970: img970?.trim() || null,
        img728: img728?.trim() || null,
        img300: img300?.trim() || null,
        position: 'rotativo',
        active: active ?? true,
      },
    })

    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error('Create ad error:', error)
    return NextResponse.json({ error: 'Erro ao criar campanha' }, { status: 500 })
  }
}
