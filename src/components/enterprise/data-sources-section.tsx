'use client'

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { refreshEnterprise } from '@/actions/enterprise.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DataSourcesSectionProps {
  dossierId: string
  siren: string | null
  inpiSyncAt: string | null
  inseeSyncAt: string | null
  inpiUpdatedAt?: string | null
}

function formatSyncDate(date: string | null | undefined): string {
  if (!date) return 'Jamais'
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  } catch {
    return date
  }
}

function getSyncStatus(syncDate: string | null | undefined): 'synced' | 'stale' | 'never' {
  if (!syncDate) return 'never'
  const now = Date.now()
  const syncTime = new Date(syncDate).getTime()
  const daysSince = (now - syncTime) / (1000 * 60 * 60 * 24)
  return daysSince > 7 ? 'stale' : 'synced'
}

export function DataSourcesSection({
  dossierId,
  siren,
  inpiSyncAt,
  inseeSyncAt,
  inpiUpdatedAt,
}: DataSourcesSectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const inpiStatus = getSyncStatus(inpiSyncAt)
  const inseeStatus = getSyncStatus(inseeSyncAt)

  const handleSyncAll = () => {
    if (!siren || isRefreshing) return

    setIsRefreshing(true)
    toast.info('Synchronisation', {
      description: 'Mise à jour de toutes les sources en cours...',
    })

    startTransition(async () => {
      try {
        const result = await refreshEnterprise(siren, dossierId)

        if (result.success) {
          toast.success('Synchronisation terminée', {
            description: 'Toutes les données ont été mises à jour.',
          })
        } else if (result.sources.insee || result.sources.inpi) {
          toast.warning('Synchronisation partielle', {
            description: `Sources synchronisées : ${[
              result.sources.insee && 'INSEE',
              result.sources.inpi && 'INPI',
            ]
              .filter(Boolean)
              .join(', ')}`,
          })
        } else {
          toast.error('Échec de la synchronisation', {
            description: result.error || 'Impossible de synchroniser les sources.',
          })
        }

        router.refresh()
      } catch (error) {
        console.error('Sync error:', error)
        toast.error('Erreur', {
          description: 'Une erreur est survenue lors de la synchronisation.',
        })
      } finally {
        setIsRefreshing(false)
      }
    })
  }

  const isLoading = isPending || isRefreshing

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-muted-foreground" />
            Sources des données
          </CardTitle>
        </div>
        <CardDescription>Provenance et fraîcheur des informations affichées</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* INSEE / SIRENE */}
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-emerald-700 text-sm dark:text-emerald-400">
                INSEE / SIRENE
              </span>
              <StatusBadge status={inseeStatus} />
            </div>
            <div className="space-y-0.5 text-muted-foreground text-xs">
              <p className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dernière sync : {formatSyncDate(inseeSyncAt)}
              </p>
              <p>Données : SIREN, SIRET, Code NAF</p>
            </div>
          </div>
        </div>

        {/* INPI / RNE */}
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-700 text-sm dark:text-blue-400">
                INPI / RNE
              </span>
              <StatusBadge status={inpiStatus} />
            </div>
            <div className="space-y-0.5 text-muted-foreground text-xs">
              <p className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dernière sync : {formatSyncDate(inpiSyncAt)}
              </p>
              {inpiUpdatedAt && (
                <p className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Mise à jour INPI : {formatSyncDate(inpiUpdatedAt)}
                </p>
              )}
              <p>Données : Identité, Capital, Dirigeants, Adresse, Historique</p>
            </div>
          </div>
        </div>

        {/* Bilans INPI */}
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-purple-700 text-sm dark:text-purple-400">
                Bilans INPI
              </span>
              <Badge variant="outline" className="border-gray-300 text-gray-500 text-xs">
                Non disponible
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">
              <p className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Les bilans sont souvent confidentiels ou non déposés
              </p>
            </div>
          </div>
        </div>

        {/* Sync button */}
        {siren && (
          <Button variant="outline" className="w-full" onClick={handleSyncAll} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Synchroniser toutes les sources
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: 'synced' | 'stale' | 'never' }) {
  if (status === 'synced') {
    return (
      <Badge
        variant="outline"
        className="border-green-300 bg-green-50 text-green-700 text-xs dark:border-green-800 dark:bg-green-950 dark:text-green-400"
      >
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Synchronisé
      </Badge>
    )
  }

  if (status === 'stale') {
    return (
      <Badge
        variant="outline"
        className="border-amber-300 bg-amber-50 text-amber-700 text-xs dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
      >
        <Clock className="mr-1 h-3 w-3" />
        Obsolète
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="border-gray-300 bg-gray-50 text-gray-500 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
    >
      <XCircle className="mr-1 h-3 w-3" />
      Non synchronisé
    </Badge>
  )
}
