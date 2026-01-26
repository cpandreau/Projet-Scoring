'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log l'erreur côté client (peut être envoyé à un service de monitoring)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-4 font-bold text-2xl">Une erreur est survenue</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Nous sommes désolés, quelque chose s'est mal passé. Veuillez réessayer ou contacter le
          support si le problème persiste.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-muted-foreground text-xs">
            Code erreur : {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button variant="outline" onClick={() => window.location.assign('/dashboard')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}
