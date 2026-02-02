import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BILANTIA — L\'équilibre financier révélé',
    short_name: 'BILANTIA',
    description:
      'Analysez la santé financière de votre entreprise. Score sur 10, alertes proactives, comparaison sectorielle.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A1628',
    theme_color: '#C9A227',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
