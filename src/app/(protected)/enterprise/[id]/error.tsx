'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface EnterpriseErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function EnterpriseError({ error, reset }: EnterpriseErrorProps) {
  useEffect(() => {
    console.error('Enterprise page error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-bold text-xl">Erreur de chargement</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Impossible de charger les données de cette entreprise. Le problème peut être temporaire.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-muted-foreground text-xs">Code : {error.digest}</p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button variant="outline" asChild>
            <Link href="/enterprise">Retour à la liste</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
