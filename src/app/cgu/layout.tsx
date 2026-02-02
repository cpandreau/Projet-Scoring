import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation',
  description:
    'Conditions générales d\'utilisation de la plateforme BILANTIA. Droits et obligations des utilisateurs.',
  alternates: {
    canonical: '/cgu',
  },
}

export default function CguLayout({ children }: { children: React.ReactNode }) {
  return children
}
