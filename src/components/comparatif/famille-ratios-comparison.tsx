'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PositionSectorielle } from '@/lib/api/sector-comparison'
import { cn } from '@/lib/utils'
import { type BenchmarkData, RatioComparisonCard } from './ratio-comparison-card'

// Icones pour les familles
const FAMILY_ICONS: Record<string, string> = {
  liquidite: '💧',
  rentabilite: '📈',
  solvabilite: '🏛️',
  activite: '⚙️',
  evolution: '📊',
}

export interface RatioData {
  id: string
  name: string
  value: number | null
  unit: '%' | 'jours' | 'ratio'
  benchmark: BenchmarkData | null
  higherIsBetter: boolean
  position?: PositionSectorielle
  percentile?: number
  ecartMediane?: number | null
}

export interface FamilleRatiosComparisonProps {
  familleId: string
  familleName: string
  ratios: RatioData[]
  defaultExpanded?: boolean
}

export function FamilleRatiosComparison({
  familleId,
  familleName,
  ratios,
  defaultExpanded = true,
}: FamilleRatiosComparisonProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  // Compter les ratios avec benchmark
  const ratiosWithBenchmark = ratios.filter((r) => r.benchmark && r.benchmark.q50 !== null)
  const ratiosWithValue = ratios.filter((r) => r.value !== null)

  // Calculer un résumé de la position
  const positionSummary = getPositionSummary(ratios)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{FAMILY_ICONS[familleId] || '📊'}</span>
            <CardTitle className="text-base">{familleName}</CardTitle>
            <span className="text-muted-foreground text-xs">
              ({ratiosWithValue.length} ratios
              {ratiosWithBenchmark.length > 0 && `, ${ratiosWithBenchmark.length} avec benchmark`})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {positionSummary && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-medium text-xs',
                  positionSummary.color
                )}
              >
                {positionSummary.label}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-2 pt-0">
          {ratios.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">
              Aucun ratio disponible pour cette famille
            </p>
          ) : (
            ratios.map((ratio) => (
              <RatioComparisonCard
                key={ratio.id}
                ratioName={ratio.name}
                ratioValue={ratio.value}
                unit={ratio.unit}
                benchmark={ratio.benchmark}
                higherIsBetter={ratio.higherIsBetter}
                position={ratio.position}
                percentile={ratio.percentile}
                ecartMediane={ratio.ecartMediane}
              />
            ))
          )}
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Calcule un résumé de la position pour la famille
 */
function getPositionSummary(ratios: RatioData[]): { label: string; color: string } | null {
  const ratiosWithPosition = ratios.filter(
    (r) => r.position && r.position !== 'non_disponible' && r.value !== null
  )

  if (ratiosWithPosition.length === 0) return null

  // Compter les positions
  const counts = {
    good: 0, // top10, top25, median_sup
    bad: 0, // bottom25, bottom10, median_inf
  }

  for (const ratio of ratiosWithPosition) {
    if (['top10', 'top25', 'median_sup'].includes(ratio.position!)) {
      counts.good++
    } else {
      counts.bad++
    }
  }

  const total = counts.good + counts.bad
  const goodRatio = counts.good / total

  if (goodRatio >= 0.7) {
    return { label: 'Bonne position', color: 'bg-green-100 text-green-700' }
  }
  if (goodRatio >= 0.5) {
    return { label: 'Position moyenne', color: 'bg-blue-100 text-blue-700' }
  }
  if (goodRatio >= 0.3) {
    return { label: 'Position fragile', color: 'bg-orange-100 text-orange-700' }
  }
  return { label: 'Position critique', color: 'bg-red-100 text-red-700' }
}
