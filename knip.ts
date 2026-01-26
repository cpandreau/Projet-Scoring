import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  $schema: 'https://unpkg.com/knip@5/schema.json',

  // Fichiers d'entrée — Knip détecte automatiquement Next.js
  entry: [
    'src/app/**/page.tsx',
    'src/app/**/layout.tsx',
    'src/app/**/route.ts',
    'src/app/**/loading.tsx',
    'src/app/**/error.tsx',
    'src/app/**/not-found.tsx',
    'src/middleware.ts',
    // APIs futures — marquées comme entry pour éviter false positives
    'src/lib/api/bodacc.ts',
    'src/lib/api/fiscalite-locale.ts',
    'src/lib/api/geo-api.ts',
  ],

  // Fichiers du projet à analyser
  project: ['src/**/*.{ts,tsx}'],

  // Fichiers/dossiers à ignorer
  ignore: ['**/*.d.ts', '**/node_modules/**', '**/.next/**'],

  // Dépendances à ignorer (faux positifs connus)
  ignoreDependencies: [
    '@types/*',
    'tailwindcss',
    '@tailwindcss/postcss',
    'tw-animate-css',
    'postcss',
    'typescript',
    'shadcn', // CLI utilisé manuellement
  ],

  // Exports à ignorer - utilisés dans le même fichier
  ignoreExportsUsedInFile: true,

  // Configuration spécifique Next.js
  next: {
    entry: [
      'next.config.{js,ts,mjs}',
      'src/app/**/{page,layout,loading,error,not-found,route,template,default}.{js,jsx,ts,tsx}',
      'src/app/**/opengraph-image.{js,jsx,ts,tsx}',
      'src/app/**/icon.{js,jsx,ts,tsx}',
    ],
  },

  // Composants UI shadcn — exports inutilisés mais gardés pour usage futur
  rules: {
    // Réduire le bruit sur les fichiers UI shadcn
    exports: 'warn',
    types: 'warn',
  },
}

export default config
