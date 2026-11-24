import PostEditorForm from '@/components/admin/PostEditorForm'
import { getCurrentAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface NovoPostPageProps {
  searchParams?: {
    subject?: string
    content?: string
    leadId?: string
  }
}

export default async function NovoPostPage({ searchParams }: NovoPostPageProps) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  const initialData = {
    title: searchParams?.subject ? decodeURIComponent(searchParams.subject) : '',
    content: searchParams?.content
      ? `<p>${decodeURIComponent(searchParams.content)}</p>`
      : '',
    authorName: admin.name || 'Redação Lavras Notícia',
    published: true,
  }

  return <PostEditorForm initialData={initialData} isEditing={false} />
}
