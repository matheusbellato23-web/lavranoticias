import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/constants'

const title = `Mural de Empregos em Lavras, Guarulhos — ${SITE_NAME}`
const description =
  'Confira vagas de emprego no bairro Lavras e região de Guarulhos (CLT, PJ, estágio e temporário) ou anuncie gratuitamente sua oportunidade.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Vagas de emprego Lavras Guarulhos',
    'Empregos Guarulhos',
    'Mural de empregos Lavras Notícia',
    'Trabalho bairro Lavras',
  ],
  alternates: {
    canonical: '/vagas',
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/vagas`,
    siteName: SITE_NAME,
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: `${SITE_URL}${DEFAULT_OG_IMAGE}`, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [`${SITE_URL}${DEFAULT_OG_IMAGE}`],
  },
}

export default function VagasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
