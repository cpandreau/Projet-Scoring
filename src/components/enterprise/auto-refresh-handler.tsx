'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { refreshEnterprise } from '@/actions/enterprise.actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface AutoRefreshHandlerProps {
  dossierId: string
  siren: string
  needsRefresh: boolean
  reason: 'never_synced' | 'cache_expired' | 'observations_stale' | null
}

export function AutoRefreshHandler({
  dossierId,
  siren,
  needsRefresh,
  reason,
}: AutoRefreshHandlerProps) {
  const router = useRouter()
  const hasTriggeredRef = useRef(false)
  const isRefreshingRef = useRef(needsRefresh && !!siren)

  const performRefresh = useCallback(async () => {
    // Show toast based on reason
    const reasonMessages: Record<string, string> = {
      never_synced: 'Première synchronisation des données...',
      cache_expired: 'Mise à jour des données (cache expiré)...',
      observations_stale: 'Actualisation des observations...',
    }

    toast.info('Synchronisation', {
      description: reason ? reasonMessages[reason] : 'Mise à jour en cours...',
    })

    try {
      const result = await refreshEnterprise(siren, dossierId)
      if (result.success) {
        toast.success('Données mises à jour', {
          description: 'Les informations ont été actualisées avec succès.',
        })
      } else if (result.sources.insee || result.sources.inpi) {
        toast.warning('Mise à jour partielle', {
          description: "Certaines données n'ont pas pu être actualisées.",
        })
      } else {
        toast.error('Échec de la mise à jour', {
          description: result.error || 'Impossible de mettre à jour les données.',
        })
      }
      // Refresh the page to show updated data
      router.refresh()
    } catch {
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la mise à jour.',
      })
    } finally {
      isRefreshingRef.current = false
    }
  }, [siren, dossierId, reason, router])

  useEffect(() => {
    // Only trigger once per mount and only if refresh is needed
    if (!needsRefresh || hasTriggeredRef.current || !siren) {
      return
    }

    hasTriggeredRef.current = true
    isRefreshingRef.current = true

    // Perform sync in background (async but not awaited)
    performRefresh()
  }, [needsRefresh, siren, performRefresh])

  // Show banner while refreshing (based on initial state)
  if (!needsRefresh || !siren) {
    return null
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <RefreshCw className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-800 dark:text-blue-200">Mise à jour des données</AlertTitle>
      <AlertDescription className="text-blue-700 dark:text-blue-300">
        Les données sont en cours de synchronisation. Vous pouvez continuer à consulter le dossier
        pendant ce temps.
      </AlertDescription>
    </Alert>
  )
}
