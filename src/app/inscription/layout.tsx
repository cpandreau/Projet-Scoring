import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Créez votre compte BILANTIA gratuitement. Analysez la santé financière de votre entreprise en 2 minutes.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children
}
