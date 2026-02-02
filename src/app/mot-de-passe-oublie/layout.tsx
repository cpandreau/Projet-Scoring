import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mot de passe oublié | BILANTIA',
  description:
    "Réinitialisez votre mot de passe BILANTIA pour récupérer l'accès à votre compte.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function MotDePasseOublieLayout({ children }: { children: React.ReactNode }) {
  return children
}
