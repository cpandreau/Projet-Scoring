'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global error boundary - remplace le layout entier en cas d'erreur critique.
 * Note: doit inclure ses propres balises html et body.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Critical error:', error)
  }, [error])

  return (
    <html lang="fr">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-labelledby="error-icon-title"
                role="img"
              >
                <title id="error-icon-title">Erreur</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mt-4 font-bold text-2xl">Erreur critique</h1>
            <p className="mt-2 text-muted-foreground">
              L'application a rencontré une erreur inattendue.
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-muted-foreground text-xs">
                Code erreur : {error.digest}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
              >
                Réessayer
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-muted"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
