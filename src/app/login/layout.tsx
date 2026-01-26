import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion',
  description:
    'Connectez-vous à Défaillantomètre pour analyser la santé financière de vos entreprises.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
