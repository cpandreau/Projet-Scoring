'use client'

import { ChevronDown, ChevronUp, Eye, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SortableHeaderLocal } from '@/components/ui/sortable-header-local'
import { cn } from '@/lib/utils'
import type { ScoreHistoryEntry } from '@/repositories/score-history.repository'
import { ScoreHistoryDetail } from './score-history-detail'

interface ScoreHistoryTableProps {
  history: ScoreHistoryEntry[]
  onDelete?: (scoreId: string) => void
  isDeleting?: boolean
}

function getScoreVariant(score: number | null): {
  className: string
  label: string
} {
  if (score === null) {
    return {
      className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      label: '-',
    }
  }
  if (score >= 8) {
    return {
      className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      label: score.toFixed(1),
    }
  }
  if (score >= 6) {
    return {
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      label: score.toFixed(1),
    }
  }
  if (score >= 4) {
    return {
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      label: score.toFixed(1),
    }
  }
  return {
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    label: score.toFixed(1),
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ScoreHistoryTable({ history, onDelete, isDeleting }: ScoreHistoryTableProps) {
  const [expanded, setExpanded] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<ScoreHistoryEntry | null>(null)
  const [sort, setSort] = useState('date_desc')

  // Tri local des données
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      switch (sort) {
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'year_desc':
          return (b.annee_exercice ?? 0) - (a.annee_exercice ?? 0)
        case 'year_asc':
          return (a.annee_exercice ?? 0) - (b.annee_exercice ?? 0)
        case 'score_desc':
          return (b.score_global ?? 0) - (a.score_global ?? 0)
        case 'score_asc':
          return (a.score_global ?? 0) - (b.score_global ?? 0)
        default:
          return 0
      }
    })
  }, [history, sort])

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-sm">Historique des calculs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-muted-foreground text-sm">
            Aucun historique disponible
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="font-medium text-sm">
              Historique des calculs ({history.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {expanded && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">
                      <SortableHeaderLocal
                        label="Date"
                        sortKey="date"
                        currentSort={sort}
                        onSort={setSort}
                      />
                    </th>
                    <th className="p-2 text-center">
                      <SortableHeaderLocal
                        label="Exercice"
                        sortKey="year"
                        currentSort={sort}
                        onSort={setSort}
                      />
                    </th>
                    <th className="p-2 text-center">
                      <SortableHeaderLocal
                        label="Score"
                        sortKey="score"
                        currentSort={sort}
                        onSort={setSort}
                      />
                    </th>
                    <th className="hidden p-3 text-center font-medium sm:table-cell">Liq.</th>
                    <th className="hidden p-3 text-center font-medium sm:table-cell">Rent.</th>
                    <th className="hidden p-3 text-center font-medium md:table-cell">Solv.</th>
                    <th className="hidden p-3 text-center font-medium md:table-cell">Act.</th>
                    <th className="hidden p-3 text-center font-medium lg:table-cell">Évol.</th>
                    <th className="w-20 p-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((entry, index) => {
                    const globalVariant = getScoreVariant(entry.score_global)
                    const isLatest = sort === 'date_desc' && index === 0

                    return (
                      <tr
                        key={entry.id}
                        className={cn(
                          'border-b transition-colors last:border-0 hover:bg-muted/50',
                          isLatest && 'bg-primary/5'
                        )}
                      >
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(entry.created_at)}</span>
                            <span className="text-muted-foreground text-xs">
                              {formatTime(entry.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-medium">{entry.annee_exercice}</span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            className={cn('font-semibold tabular-nums', globalVariant.className)}
                          >
                            {globalVariant.label}
                          </Badge>
                        </td>
                        <td className="hidden p-3 text-center sm:table-cell">
                          <ScoreCell score={entry.score_liquidite} />
                        </td>
                        <td className="hidden p-3 text-center sm:table-cell">
                          <ScoreCell score={entry.score_rentabilite} />
                        </td>
                        <td className="hidden p-3 text-center md:table-cell">
                          <ScoreCell score={entry.score_solvabilite} />
                        </td>
                        <td className="hidden p-3 text-center md:table-cell">
                          <ScoreCell score={entry.score_activite} />
                        </td>
                        <td className="hidden p-3 text-center lg:table-cell">
                          <ScoreCell score={entry.score_evolution} />
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedEntry(entry)}
                              title="Voir le détail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => onDelete(entry.id)}
                                disabled={isDeleting}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modal de détail */}
      <ScoreHistoryDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </>
  )
}

function ScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <span className={cn('font-medium text-xs', getTextColorClass(score))}>{score.toFixed(1)}</span>
  )
}

function getTextColorClass(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400'
  if (score >= 6) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 4) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}
