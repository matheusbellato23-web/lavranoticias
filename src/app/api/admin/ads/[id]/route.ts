import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (typeof body.title === 'string') data.title = body.title.trim()
    if (typeof body.altText === 'string') data.altText = body.altText.trim()
    if (body.linkUrl !== undefined) data.linkUrl = body.linkUrl ? String(body.linkUrl).trim() : null
    if (body.img970 !== undefined) data.img970 = body.img970 ? String(body.img970).trim() : null
    if (body.img728 !== undefined) data.img728 = body.img728 ? String(body.img728).trim() : null
    if (body.img300 !== undefined) data.img300 = body.img300 ? String(body.img300).trim() : null
    if (typeof body.active === 'boolean') data.active = body.active

    const ad = await prisma.ad.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error('Update ad error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar campanha' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    await prisma.ad.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete ad error:', error)
    return NextResponse.json({ error: 'Erro ao excluir campanha' }, { status: 500 })
  }
}
