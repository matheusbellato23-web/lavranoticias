import PostEditorForm from '@/components/admin/PostEditorForm'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  })

  if (!post) {
    notFound()
  }

  return (
    <PostEditorForm
      initialData={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        authorName: post.authorName,
        categoryId: post.categoryId,
        featured: post.featured,
        published: post.published,
      }}
      isEditing={true}
    />
  )
}
