import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const where: any = { published: true }
    if (type) {
      where.type = type
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { location: { contains: search } },
      ]
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar vagas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, company, location, type, description, contact } = body

    if (!title || !company || !description || !contact) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios' }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location: location || 'Lavras, Guarulhos – SP',
        type: type || 'CLT',
        description,
        contact,
        published: true, // published directly or moderation
      },
    })

    return NextResponse.json({ success: true, job })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar vaga' }, { status: 500 })
  }
}
