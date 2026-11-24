import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(leads)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const contact = formData.get('contact') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string
    const file = formData.get('file') as File | null

    if (!name || !contact || !message) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    let fileUrl: string | null = null

    if (file && file.size > 0 && file.name) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${Date.now()}-${sanitizedName}`
      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      fileUrl = `/uploads/${fileName}`
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        contact,
        subject: subject || 'Notícia enviada por morador',
        message,
        fileUrl,
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Lead submission error:', error)
    return NextResponse.json({ error: 'Falha ao processar envio' }, { status: 500 })
  }
}
