import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pour les Dirigeants TPE/PME',
  description:
    'Dirigeant de TPE/PME, reprenez le contrôle de vos finances. Comprenez votre santé financière sans attendre le RDV annuel chez le comptable. Score clair sur 10.',
  openGraph: {
    title: 'BILANTIA pour Dirigeants — Reprenez le contrôle de vos finances',
    description:
      'Score instantané, alertes proactives, langage humain. Fini de naviguer à vue, anticipez les problèmes.',
    url: '/dirigeants',
  },
  twitter: {
    title: 'BILANTIA pour Dirigeants — Reprenez le contrôle',
    description:
      'Score instantané, alertes proactives, langage humain. Fini de naviguer à vue.',
  },
  alternates: {
    canonical: '/dirigeants',
  },
}

export default function DirigeantsLayout({ children }: { children: React.ReactNode }) {
  return children
}
