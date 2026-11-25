import type { Metadata } from 'next'
import { Archivo, Archivo_Black, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import { getSiteSeoSettings } from '@/lib/seo'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
})

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings()
  const titleDefault = `${SITE_NAME} – A informação do nosso bairro`
  const ogImageUrl = seo.defaultOgImage.startsWith('http')
    ? seo.defaultOgImage
    : `${SITE_URL}${seo.defaultOgImage}`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: titleDefault,
      template: `%s`,
    },
    description: seo.defaultDescription,
    applicationName: SITE_NAME,
    keywords: [
      'Lavras Notícia',
      'Bairro Lavras Guarulhos',
      'Notícias de Guarulhos',
      'Guarulhos SP',
      'Jornal de bairro Guarulhos',
      'Vagas de emprego Lavras Guarulhos',
      'Trânsito Lavras Guarulhos',
      'Obras Prefeitura de Guarulhos',
    ],
    authors: [{ name: `Redação ${SITE_NAME}`, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: '/',
    },
    verification: seo.googleSiteVerification
      ? { google: seo.googleSiteVerification }
      : undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: titleDefault,
      description: seo.defaultDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1600,
          height: 912,
          alt: titleDefault,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleDefault,
      description: seo.defaultDescription,
      images: [ogImageUrl],
    },
    icons: {
      icon: [
        { url: '/favicon.png', type: 'image/png' },
        { url: '/favicon.ico', type: 'image/x-icon' },
      ],
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seo = await getSiteSeoSettings()

  return (
    <html lang="pt-BR" className={`${archivo.variable} ${archivoBlack.variable} ${sourceSerif.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="font-sans min-h-screen bg-background text-foreground flex flex-col">
        <GoogleAnalytics measurementId={seo.gaMeasurementId} />
        {children}
      </body>
    </html>
  )
}
