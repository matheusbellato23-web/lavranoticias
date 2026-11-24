import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { title, date, location, description } = await request.json()
    if (!title || !date) return NextResponse.json({ error: 'Título e data são obrigatórios' }, { status: 400 })

    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        location,
        description,
        published: true,
      },
    })
    return NextResponse.json({ success: true, event })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 })
  }
}
