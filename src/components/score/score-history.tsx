'use client'

import { History, Loader2, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useOptimistic, useState, useTransition } from 'react'

import { calculateEnterpriseScore } from '@/actions/score.actions'
import { deleteScoreHistory } from '@/actions/score-history.actions'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { showError, showSuccess } from '@/lib/toast'
import type { ScoreHistoryEntry } from '@/repositories/score-history.repository'
import { ScoreHistoryTable } from './score-history-table'

// Lazy load du chart Recharts
const ScoreHistoryChart = dynamic(
  () => import('./score-history-chart').then((m) => m.ScoreHistoryChart),
  { loading: () => <Skeleton className="h-[200px] w-full" />, ssr: false }
)

interface ScoreHistoryProps {
  enterpriseId: string
  history: ScoreHistoryEntry[]
}

export function ScoreHistory({ enterpriseId, history }: ScoreHistoryProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRecalculating, setIsRecalculating] = useState(false)

  // useOptimistic pour suppression instantanee (React 19)
  const [optimisticHistory, removeEntry] = useOptimistic(
    history,
    (state: ScoreHistoryEntry[], idToRemove: string) =>
      state.filter((entry) => entry.id !== idToRemove)
  )

  const handleDelete = (scoreId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet historique de score ?')) {
      return
    }

    startTransition(async () => {
      // Update optimiste immediat - l'entree disparait instantanement
      removeEntry(scoreId)

      const result = await deleteScoreHistory(scoreId)

      if (result.success) {
        showSuccess('Supprime', "L'entree d'historique a ete supprimee")
        router.refresh()
      } else {
        // En cas d'erreur, React restore automatiquement l'etat precedent
        showError('Erreur', result.error || 'Impossible de supprimer')
      }
    })
  }

  const handleRecalculate = async () => {
    setIsRecalculating(true)
    try {
      const result = await calculateEnterpriseScore(enterpriseId)

      if (result.success) {
        showSuccess('Recalcule', "Le score a ete recalcule et l'historique mis a jour")
        router.refresh()
      } else {
        showError('Erreur', result.error || 'Erreur lors du recalcul')
      }
    } catch (error) {
      console.error('Erreur recalcul:', error)
      showError('Erreur', 'Une erreur est survenue lors du recalcul')
    } finally {
      setIsRecalculating(false)
    }
  }

  if (optimisticHistory.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">Historique des scores</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleRecalculate} disabled={isRecalculating}>
          {isRecalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recalcul...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recalculer
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScoreHistoryChart history={optimisticHistory} />
        <div className="lg:col-span-1">
          {/* Placeholder pour d'autres statistiques si necessaire */}
        </div>
      </div>

      <ScoreHistoryTable
        history={optimisticHistory}
        onDelete={handleDelete}
        isDeleting={isPending}
      />
    </div>
  )
}
