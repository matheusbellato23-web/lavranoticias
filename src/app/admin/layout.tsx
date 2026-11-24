import AdminLayoutClient from '@/components/admin/AdminLayoutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel Administrativo – Lavras Notícia',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
