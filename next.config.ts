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
}

export default nextConfig
