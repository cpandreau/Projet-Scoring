import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales de BILANTIA. Informations sur l\'éditeur, l\'hébergement et la propriété intellectuelle.',
  alternates: {
    canonical: '/mentions-legales',
  },
}

export default function MentionsLegalesLayout({ children }: { children: React.ReactNode }) {
  return children
}
