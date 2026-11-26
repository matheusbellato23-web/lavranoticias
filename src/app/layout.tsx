import type { Metadata, Viewport } from 'next'
import { Archivo, Archivo_Black, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import { getSiteSeoSettings } from '@/lib/seo'
import { isValidGaMeasurementId, isValidGtmId } from '@/lib/analytics-events'
import GoogleAnalytics, { GoogleTagManagerNoScript } from '@/components/analytics/GoogleAnalytics'

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0038a8',
}

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
    referrer: 'strict-origin-when-cross-origin',
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
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
  const gaId = seo.gaMeasurementId.trim()
  const gtmId = seo.gtmId.trim()
  const hasGa = isValidGaMeasurementId(gaId)
  const hasGtm = isValidGtmId(gtmId)

  return (
    <html lang="pt-BR" className={`${archivo.variable} ${archivoBlack.variable} ${sourceSerif.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Google Tag (gtag.js) injetada diretamente no <head> SSR para detecção imediata */}
        {hasGa && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            />
            <script
              id="google-analytics-init"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); if (!window.location.pathname.startsWith('/admin')) { gtag('config', '${gaId}', { anonymize_ip: true, cookie_flags: 'SameSite=None;Secure' }); }`,
              }}
            />
          </>
        )}

        {/* Google Tag Manager (opcional, quando GTM_ID configurado) */}
        {hasGtm && (
          <script
            id="google-tag-manager-init"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}
      </head>
      <body className="font-sans min-h-screen bg-background text-foreground flex flex-col">
        <GoogleTagManagerNoScript gtmId={gtmId} />
        <GoogleAnalytics measurementId={gaId} gtmId={gtmId} />
        {children}
      </body>
    </html>
  )
}
