import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pour les Experts-Comptables',
  description:
    'Experts-comptables, valorisez votre expertise. Analysez en 2 minutes, présentez en 2 clics. Dashboard multi-clients, vue présentation et alertes consolidées.',
  openGraph: {
    title: 'BILANTIA pour Experts-Comptables — Valorisez votre expertise',
    description:
      'Dashboard multi-clients, vue présentation, upload batch. Passez du temps sur le conseil, pas sur l\'analyse.',
    url: '/experts-comptables',
  },
  twitter: {
    title: 'BILANTIA pour Experts-Comptables — Valorisez votre expertise',
    description:
      'Dashboard multi-clients, vue présentation. Passez du temps sur le conseil.',
  },
  alternates: {
    canonical: '/experts-comptables',
  },
}

export default function ExpertsComptablesLayout({ children }: { children: React.ReactNode }) {
  return children
}
