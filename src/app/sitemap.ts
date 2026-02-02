import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bilantia.fr'
  const lastModified = new Date()

  // Pages statiques publiques avec leurs priorités et fréquences de mise à jour
  const staticPages: {
    route: string
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority: number
  }[] = [
    { route: '', changeFrequency: 'weekly', priority: 1.0 },
    { route: '/produit', changeFrequency: 'monthly', priority: 0.9 },
    { route: '/tarifs', changeFrequency: 'monthly', priority: 0.9 },
    { route: '/dirigeants', changeFrequency: 'monthly', priority: 0.8 },
    { route: '/experts-comptables', changeFrequency: 'monthly', priority: 0.8 },
    { route: '/mentions-legales', changeFrequency: 'yearly', priority: 0.3 },
    { route: '/cgu', changeFrequency: 'yearly', priority: 0.3 },
    { route: '/confidentialite', changeFrequency: 'yearly', priority: 0.3 },
  ]

  return staticPages.map(({ route, changeFrequency, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
