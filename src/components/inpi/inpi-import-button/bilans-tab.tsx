'use client'

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

import type { BilansState } from './inpi-import-button.types'
import { formatDate } from './inpi-import-button.utils'

interface BilansTabProps {
  state: BilansState
  onLoadDetail: (bilanId: string) => void
  onBackToList: () => void
  onRetry: () => void
}

/**
 * Onglet affichant la liste des bilans et le détail d'un bilan
 */
export function BilansTab({ state, onLoadDetail, onBackToList, onRetry }: BilansTabProps) {
  if (state.type === 'loading') {
    return (
      <div className="space-y-3 py-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Recherche des bilans disponibles...
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (state.type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{state.message}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  if (state.type === 'loaded') {
    return (
      <ScrollArea className="h-[450px] pr-4">
        <div className="space-y-2">
          {state.bilans.map((bilan) => (
            <div
              key={bilan.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{bilan.typeBilan || 'Bilan'}</span>
                    <Badge variant="secondary" className="text-xs">
                      {bilan.confidentialite}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" />
                    Clôture : {formatDate(bilan.dateCloture)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoadDetail(bilan.id)}
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                Voir
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  if (state.type === 'detail-loading') {
    return (
      <div className="space-y-3 py-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des données du bilan...
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (state.type === 'detail') {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={onBackToList} className="-ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Button>

        <ScrollArea className="h-[400px] rounded-lg border">
          <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs">
            {JSON.stringify(state.bilan, null, 2)}
          </pre>
        </ScrollArea>
      </div>
    )
  }

  return null
}
