'use client'

import { Loader2, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { refreshEnterprise } from '@/actions/enterprise.actions'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { FreshnessStatus } from '@/lib/services/entreprise-sync-service'

interface FreshnessIndicatorProps {
  status: FreshnessStatus
  inpiSyncAt: Date | null
  inseeSyncAt: Date | null
  message: string
  dossierId: string
  siren: string | null
}

const statusConfig: Record<FreshnessStatus, { color: string; bgColor: string; label: string }> = {
  fresh: {
    color: 'bg-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'À jour',
  },
  stale: {
    color: 'bg-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    label: 'À actualiser',
  },
  outdated: {
    color: 'bg-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Obsolète',
  },
  never: {
    color: 'bg-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Non synchronisé',
  },
}

function formatSyncDate(date: Date | null): string {
  if (!date) return 'Jamais'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function FreshnessIndicator({
  status,
  inpiSyncAt,
  inseeSyncAt,
  message,
  dossierId,
  siren,
}: FreshnessIndicatorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const config = statusConfig[status]

  const handleManualRefresh = () => {
    if (!siren || isRefreshing) return

    setIsRefreshing(true)
    toast.info('Synchronisation', {
      description: 'Mise à jour des données en cours...',
    })

    startTransition(async () => {
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

        router.refresh()
      } catch (error) {
        console.error('Manual refresh error:', error)
        toast.error('Erreur', {
          description: 'Une erreur est survenue lors de la mise à jour.',
        })
      } finally {
        setIsRefreshing(false)
      }
    })
  }

  const isLoading = isPending || isRefreshing

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-xs ${config.bgColor} cursor-help`}
            >
              <span
                className={`h-2 w-2 rounded-full ${config.color} ${
                  status === 'fresh' ? 'animate-pulse' : ''
                }`}
              />
              <span className="hidden sm:inline">{config.label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1 text-sm">
              <p className="font-medium">{message}</p>
              <div className="space-y-0.5 text-muted-foreground">
                <p>INPI : {formatSyncDate(inpiSyncAt)}</p>
                <p>INSEE : {formatSyncDate(inseeSyncAt)}</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {siren && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleManualRefresh}
                disabled={isLoading}
                aria-label="Rafraîchir les données"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="sr-only">Rafraîchir les données</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rafraîchir les données</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
