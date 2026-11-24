import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search')

  const where: any = {}
  if (categoryId) where.categoryId = categoryId
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
    ]
  }

  const posts = await prisma.post.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, slug, excerpt, content, coverImage, authorName, categoryId, featured, published } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Generate or sanitize slug
    const finalSlug = (slug || title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // If featured is true, optionally unfeature previous hero if desired, or keep multiple
    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        authorName: authorName || admin.name || 'Redação Lavras Notícia',
        categoryId: categoryId || null,
        featured: Boolean(featured),
        published: Boolean(published),
        publishedAt: published ? new Date() : new Date(),
        userId: admin.userId,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    console.error('Post creation error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um artigo com este slug (título similar). Altere o slug.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao salvar artigo' }, { status: 500 })
  }
}
