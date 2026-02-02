import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fonctionnalités',
  description:
    'Découvrez les 5 piliers de BILANTIA : intelligence prédictive, surveillance réseau, simplicité radicale, actions concrètes et collaboration comptable-dirigeant.',
  openGraph: {
    title: 'Fonctionnalités BILANTIA — 5 piliers pour votre santé financière',
    description:
      'Score projeté à 12 mois, surveillance de votre écosystème, traduction humaine des ratios, suggestions d\'actions et collaboration avec votre comptable.',
    url: '/produit',
  },
  twitter: {
    title: 'Fonctionnalités BILANTIA — 5 piliers pour votre santé financière',
    description:
      'Score projeté, surveillance réseau, langage humain, actions concrètes et collaboration.',
  },
  alternates: {
    canonical: '/produit',
  },
}

export default function ProduitLayout({ children }: { children: React.ReactNode }) {
  return children
}
