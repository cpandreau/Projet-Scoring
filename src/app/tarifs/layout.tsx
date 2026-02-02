import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    'Plans BILANTIA : Gratuit, Essentiel (29€/mois), Pro (59€/mois) pour dirigeants. Solo (79€/mois) et Cabinet (199€/mois) pour experts-comptables. Sans engagement.',
  openGraph: {
    title: 'Tarifs BILANTIA — À partir de 0€/mois',
    description:
      'Plans flexibles pour dirigeants TPE/PME et experts-comptables. Commencez gratuitement, sans carte bancaire.',
    url: '/tarifs',
  },
  twitter: {
    title: 'Tarifs BILANTIA — À partir de 0€/mois',
    description:
      'Plans flexibles pour dirigeants et comptables. Gratuit pour commencer.',
  },
  alternates: {
    canonical: '/tarifs',
  },
}

// JSON-LD Structured Data for pricing
const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'BILANTIA',
  description: 'Plateforme d\'analyse de santé financière pour TPE/PME et experts-comptables',
  brand: {
    '@type': 'Brand',
    name: 'BILANTIA',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Gratuit',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Score global, 1 entreprise, traduction humaine des ratios',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Essentiel',
      price: '29',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '29',
        priceCurrency: 'EUR',
        unitCode: 'MON',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: '1',
          unitCode: 'MON',
        },
      },
      description: 'Historique 2 ans, comparatif sectoriel, alertes email, export PDF',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '59',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '59',
        priceCurrency: 'EUR',
        unitCode: 'MON',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: '1',
          unitCode: 'MON',
        },
      },
      description: 'Réseau 10 partenaires, surveillance BODACC, score projeté, scénarios What if',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Solo (Experts-Comptables)',
      price: '79',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '79',
        priceCurrency: 'EUR',
        unitCode: 'MON',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: '1',
          unitCode: 'MON',
        },
      },
      description: 'Jusqu\'à 15 clients, dashboard multi-clients, vue présentation',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Cabinet (Experts-Comptables)',
      price: '199',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '199',
        priceCurrency: 'EUR',
        unitCode: 'MON',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: '1',
          unitCode: 'MON',
        },
      },
      description: 'Clients illimités, 5 utilisateurs cabinet, upload batch, support prioritaire',
      availability: 'https://schema.org/InStock',
    },
  ],
}

export default function TarifsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      {children}
    </>
  )
}
