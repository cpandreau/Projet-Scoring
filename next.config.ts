import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,

  // Activer le mode strict React (détecte les problèmes)
  reactStrictMode: true,

  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Redirections permanentes des anciennes routes auth
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/connexion',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/inscription',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/cgu',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/confidentialite',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
