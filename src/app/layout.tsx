import type { Metadata } from 'next'
import { Archivo, Archivo_Black, Source_Serif_4 } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
  metadataBase: new URL('https://lavrasnoticias.com'),
  title: 'Lavras Notícia – A informação do nosso bairro',
  description: 'Jornal digital comunitário e independente do bairro Lavras — Guarulhos, São Paulo.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${archivoBlack.variable} ${sourceSerif.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Archivo:wght@400;600;700&display=swap"
        />
      </head>
      <body className="font-sans min-h-screen bg-background text-foreground flex flex-col">
        {children}
      </body>
    </html>
  )
}
