import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import { fontVariables } from '@/lib/fonts'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bilantia.fr'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'BILANTIA — L\'équilibre financier révélé',
    template: '%s | BILANTIA',
  },
  description:
    'Analysez la santé financière de votre entreprise en 2 minutes. Score sur 10, alertes proactives, comparaison sectorielle. Pour dirigeants TPE/PME et experts-comptables.',
  keywords: [
    'santé financière',
    'analyse financière',
    'TPE',
    'PME',
    'expert-comptable',
    'score financier',
    'ratios financiers',
    'liasse fiscale',
    'benchmark sectoriel',
    'risque défaillance',
    'intelligence financière',
  ],
  authors: [{ name: 'BILANTIA' }],
  creator: 'BILANTIA',
  publisher: 'BILANTIA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: baseUrl,
    siteName: 'BILANTIA',
    title: 'BILANTIA — L\'équilibre financier révélé',
    description:
      'Analysez la santé financière de votre entreprise en 2 minutes. Score sur 10, alertes proactives, comparaison sectorielle.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BILANTIA - Plateforme d\'analyse financière pour TPE/PME',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BILANTIA — L\'équilibre financier révélé',
    description:
      'Analysez la santé financière de votre entreprise en 2 minutes. Score sur 10, alertes proactives.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
}

// JSON-LD Structured Data for the application
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BILANTIA',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Plateforme d\'analyse de santé financière pour TPE/PME et experts-comptables. Score sur 10, alertes proactives, comparaison sectorielle.',
  url: baseUrl,
  author: {
    '@type': 'Organization',
    name: 'BILANTIA',
    url: baseUrl,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Plan gratuit disponible - Essayez sans engagement',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '50',
    bestRating: '5',
    worstRating: '1',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${fontVariables} antialiased`}>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
