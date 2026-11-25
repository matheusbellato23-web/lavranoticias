import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  if (!post) {
    return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, slug, excerpt, content, coverImage, authorName, categoryId, featured, published } = body

    const existing = await prisma.post.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }

    const data: any = {}
    if (title !== undefined) data.title = title
    if (slug !== undefined) {
      data.slug = slug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }
    if (excerpt !== undefined) data.excerpt = excerpt
    if (content !== undefined) data.content = content
    if (coverImage !== undefined) data.coverImage = coverImage
    if (authorName !== undefined) data.authorName = authorName
    if (categoryId !== undefined) {
      if (categoryId) {
        const cat = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { id: true },
        })
        data.categoryId = cat?.id ?? null
      } else {
        data.categoryId = null
      }
    }
    if (featured !== undefined) data.featured = Boolean(featured)
    if (published !== undefined) {
      data.published = Boolean(published)
      if (published && !existing.published) {
        data.publishedAt = new Date()
      }
    }

    const updated = await prisma.post.update({
      where: { id: params.id },
      data,
    })

    revalidatePath('/')
    revalidatePath(`/noticia/${updated.slug}`)
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ success: true, post: updated })
  } catch (error: any) {
    console.error('Update error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe outro artigo com este slug.' }, { status: 409 })
    }
    return NextResponse.json(
      { error: `Erro ao atualizar artigo${error?.code ? ` (${error.code})` : ''}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await prisma.post.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir artigo' }, { status: 500 })
  }
}
