import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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
    const sanitizedSlug = (slug || title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    const finalSlug = sanitizedSlug || `noticia-${Date.now()}`

    // Resolve real user in DB (guards against stale JWT userId after DB resets/migrations)
    const dbUser =
      (admin.userId
        ? await prisma.user.findUnique({ where: { id: admin.userId }, select: { id: true } })
        : null) ||
      (admin.email
        ? await prisma.user.findUnique({ where: { email: admin.email }, select: { id: true } })
        : null)

    // Validate categoryId safely against DB
    let validCategoryId: string | null = null
    if (categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      })
      validCategoryId = cat?.id ?? null
    }

    const post = await prisma.post.create({
      data: {
        title: String(title).trim(),
        slug: finalSlug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        authorName: authorName || admin.name || 'Redação Lavras Notícia',
        categoryId: validCategoryId,
        featured: Boolean(featured),
        published: Boolean(published),
        publishedAt: new Date(),
        userId: dbUser?.id ?? null,
      },
    })

    revalidatePath('/')
    revalidatePath('/sitemap.xml')
    revalidatePath('/sitemap-news.xml')

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    console.error('Post creation error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um artigo com este slug (título similar). Altere o slug.' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: `Erro ao salvar artigo${error?.code ? ` (${error.code})` : ''}` },
      { status: 500 }
    )
  }
}
