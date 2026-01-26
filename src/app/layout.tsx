import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Défaillantomètre',
    template: '%s | Défaillantomètre',
  },
  description:
    'Application de scoring financier et analyse de risque de défaillance pour les entreprises françaises.',
  keywords: [
    'scoring',
    'finance',
    'entreprise',
    'défaillance',
    'risque',
    'analyse',
    'PME',
    'TPE',
    'liasse fiscale',
  ],
  authors: [{ name: 'Synaptic Hub' }],

  // OpenGraph
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Défaillantomètre',
    title: 'Défaillantomètre',
    description:
      'Application de scoring financier et analyse de risque de défaillance pour les entreprises françaises.',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Défaillantomètre',
    description:
      'Application de scoring financier et analyse de risque de défaillance pour les entreprises françaises.',
  },

  // App privée - ne pas indexer par défaut
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
