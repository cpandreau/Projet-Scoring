import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion',
  description:
    'Connectez-vous à votre compte BILANTIA pour accéder à votre tableau de bord financier.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return children
}
