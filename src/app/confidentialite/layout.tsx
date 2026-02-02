import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description:
    'Politique de confidentialité RGPD de BILANTIA. Comment nous collectons, utilisons et protégeons vos données personnelles.',
  alternates: {
    canonical: '/confidentialite',
  },
}

export default function ConfidentialiteLayout({ children }: { children: React.ReactNode }) {
  return children
}
