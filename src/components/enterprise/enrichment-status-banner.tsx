'use client'

import { AlertTriangle, Clock, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { checkEnrichmentStatus, retryEnrichment } from '@/actions/enterprise.actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { EnrichmentStatus } from '@/types'

interface EnrichmentStatusBannerProps {
  status: EnrichmentStatus | null
  dossierId: string
}

const POLLING_INTERVAL = 2000 // 2 seconds
const POLLING_TIMEOUT = 30000 // 30 seconds - safety timeout

function isPollingStatus(status: EnrichmentStatus | null): boolean {
  return status === 'pending' || status === 'in_progress'
}

export function EnrichmentStatusBanner({
  status: initialStatus,
  dossierId,
}: EnrichmentStatusBannerProps) {
  const router = useRouter()
  const [status, setStatus] = useState<EnrichmentStatus | null>(initialStatus)
  const [isPending, startTransition] = useTransition()
  const [isTimedOut, setIsTimedOut] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const statusRef = useRef<EnrichmentStatus | null>(initialStatus)

  // Track previous values for state adjustment during rendering (React recommended pattern)
  const [prevInitialStatus, setPrevInitialStatus] = useState(initialStatus)
  const [prevPollingState, setPrevPollingState] = useState(isPollingStatus(initialStatus))

  // Adjust state during rendering when props change (React recommended pattern)
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (prevInitialStatus !== initialStatus) {
    setPrevInitialStatus(initialStatus)
    setStatus(initialStatus)
  }

  // Reset isTimedOut when polling starts (during render, not in effect)
  const currentlyPolling = isPollingStatus(initialStatus)
  if (currentlyPolling && !prevPollingState) {
    setPrevPollingState(true)
    setIsTimedOut(false)
  } else if (!currentlyPolling && prevPollingState) {
    setPrevPollingState(false)
  }

  // Keep statusRef in sync with status state
  useEffect(() => {
    statusRef.current = status
  }, [status])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleTimeout = useCallback(() => {
    stopPolling()
    setIsTimedOut(true)
    toast.warning('Enrichissement en attente', {
      description: "L'opération prend plus de temps que prévu. Vous pouvez rafraîchir la page.",
    })
  }, [stopPolling])

  const pollStatus = useCallback(async () => {
    try {
      const result = await checkEnrichmentStatus(dossierId)

      if (result.status && result.status !== statusRef.current) {
        // Update status
        setStatus(result.status)

        // If status is now final, stop polling
        if (!isPollingStatus(result.status)) {
          stopPolling()

          // Show toast based on new status
          if (result.status === 'completed') {
            toast.success('Enrichissement terminé', {
              description: 'Les données INPI ont été récupérées avec succès.',
            })
          } else if (result.status === 'partial') {
            toast.warning('Enrichissement partiel', {
              description: "Certaines données n'ont pas pu être récupérées.",
            })
          } else if (result.status === 'failed') {
            toast.error("Échec de l'enrichissement", {
              description: "Les données INPI n'ont pas pu être récupérées.",
            })
          }

          // Refresh to show updated data
          router.refresh()
        }
      }
    } catch (error) {
      console.error('[EnrichmentStatusBanner] Poll error:', error)
    }
  }, [dossierId, router, stopPolling])

  // Handle polling for pending/in_progress statuses
  useEffect(() => {
    // Only start polling if status is pending or in_progress
    if (!isPollingStatus(initialStatus)) {
      return
    }

    // Start polling
    pollingRef.current = setInterval(pollStatus, POLLING_INTERVAL)

    // Safety timeout - stop polling after POLLING_TIMEOUT
    timeoutRef.current = setTimeout(handleTimeout, POLLING_TIMEOUT)

    // Cleanup on unmount
    return () => {
      stopPolling()
    }
  }, [initialStatus, pollStatus, handleTimeout, stopPolling])

  const handleRetry = () => {
    startTransition(async () => {
      const result = await retryEnrichment(dossierId)
      if (result.success) {
        setStatus('in_progress')
        toast.info('Enrichissement relancé', {
          description: 'Les données seront récupérées dans quelques secondes.',
        })
      } else {
        toast.error('Erreur', {
          description: result.error || "Impossible de relancer l'enrichissement.",
        })
      }
    })
  }

  // Don't render anything for completed status
  if (status === 'completed' || status === null) {
    return null
  }

  // Pending or In Progress
  if (status === 'pending' || status === 'in_progress') {
    // Timed out state - show refresh button
    if (isTimedOut) {
      return (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            Enrichissement en attente
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <p>
              L&apos;enrichissement prend plus de temps que prévu. Les données peuvent être déjà
              disponibles.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Rafraîchir la page
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    // Normal loading state
    return (
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">
          Enrichissement en cours
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Les informations INPI sont en cours de récupération. Cette opération peut prendre quelques
          secondes...
        </AlertDescription>
      </Alert>
    )
  }

  // Partial success
  if (status === 'partial') {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">
          Enrichissement partiel
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          <p>Certaines données n&apos;ont pas pu être récupérées.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
            onClick={handleRetry}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Failed
  if (status === 'failed') {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertTitle className="text-red-800 dark:text-red-200">
          Échec de l&apos;enrichissement
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300">
          <p>Les données INPI n&apos;ont pas pu être récupérées.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
            onClick={handleRetry}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
