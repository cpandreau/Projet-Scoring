'use client'

import { Info, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { PositionSectorielle } from '@/lib/api/sector-comparison'
import { cn } from '@/lib/utils'

export interface BenchmarkData {
  q10: number | null
  q25: number | null
  q50: number | null
  q75: number | null
  q90: number | null
}

export interface RatioComparisonCardProps {
  ratioName: string
  ratioValue: number | null
  unit: '%' | 'jours' | 'ratio'
  benchmark: BenchmarkData | null
  higherIsBetter: boolean
  position?: PositionSectorielle
  percentile?: number
  ecartMediane?: number | null
}

const POSITION_CONFIG: Record<
  PositionSectorielle,
  { label: string; color: string; bgColor: string }
> = {
  top10: { label: 'Top 10%', color: 'text-green-700', bgColor: 'bg-green-100' },
  top25: { label: 'Top 25%', color: 'text-green-600', bgColor: 'bg-green-50' },
  median_sup: {
    label: 'Au-dessus médiane',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  median_inf: {
    label: 'Sous médiane',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  bottom25: {
    label: 'Bottom 25%',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  bottom10: {
    label: 'Bottom 10%',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  non_disponible: {
    label: 'N/A',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
}

function formatValue(value: number | null, unit: '%' | 'jours' | 'ratio'): string {
  if (value === null) return '-'
  if (unit === 'jours') {
    return `${Math.round(value)} j`
  }
  if (unit === '%') {
    return `${value.toFixed(1)}%`
  }
  return value.toFixed(2)
}

export function RatioComparisonCard({
  ratioName,
  ratioValue,
  unit,
  benchmark,
  higherIsBetter,
  position,
  percentile,
  ecartMediane,
}: RatioComparisonCardProps) {
  const hasBenchmark = benchmark && benchmark.q50 !== null
  const hasValue = ratioValue !== null

  // Si pas de valeur entreprise, afficher grisé
  if (!hasValue) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 opacity-50">
        <span className="text-muted-foreground text-sm">{ratioName}</span>
        <span className="text-muted-foreground text-xs">Donnée non disponible</span>
      </div>
    )
  }

  // Si pas de benchmark, afficher la valeur entreprise seule
  if (!hasBenchmark) {
    return (
      <div className="space-y-1 rounded-lg border border-dashed px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">{ratioName}</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{formatValue(ratioValue, unit)}</span>
            <Badge variant="outline" className="text-muted-foreground text-xs">
              Pas de benchmark
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  // Affichage complet avec benchmark
  const config = POSITION_CONFIG[position || 'non_disponible']

  return (
    <div className="space-y-1.5 rounded-lg border px-3 py-2">
      {/* Ligne principale */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="truncate text-sm">{ratioName}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 shrink-0 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-1.5 text-xs">
                  <p className="font-medium">Quartiles sectoriels</p>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    <div>
                      <div className="text-muted-foreground">Q10</div>
                      <div>{benchmark.q10?.toFixed(1) ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Q25</div>
                      <div>{benchmark.q25?.toFixed(1) ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Q50</div>
                      <div className="font-medium">{benchmark.q50?.toFixed(1) ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Q75</div>
                      <div>{benchmark.q75?.toFixed(1) ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Q90</div>
                      <div>{benchmark.q90?.toFixed(1) ?? '-'}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {higherIsBetter ? 'Plus élevé = mieux' : 'Plus bas = mieux'}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Valeur entreprise */}
          <span className="font-semibold text-sm tabular-nums">
            {formatValue(ratioValue, unit)}
          </span>

          {/* Badge position */}
          <Badge className={cn('text-xs', config.bgColor, config.color)}>{config.label}</Badge>
        </div>
      </div>

      {/* Barre de position */}
      <div className="relative">
        <Progress value={percentile ?? 50} className="h-1.5" />
        {/* Marqueur médiane */}
        <div
          className="absolute top-0 h-1.5 w-0.5 bg-gray-400"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Ligne inférieure : médiane secteur + écart */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Médiane secteur : {formatValue(benchmark.q50, unit)}
        </span>
        {ecartMediane !== null && ecartMediane !== undefined && (
          <div
            className={cn(
              'flex items-center gap-0.5',
              ecartMediane > 0
                ? higherIsBetter
                  ? 'text-green-600'
                  : 'text-red-500'
                : ecartMediane < 0
                  ? higherIsBetter
                    ? 'text-red-500'
                    : 'text-green-600'
                  : 'text-muted-foreground'
            )}
          >
            {ecartMediane > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : ecartMediane < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span>
              {ecartMediane > 0 ? '+' : ''}
              {ecartMediane.toFixed(0)}% vs médiane
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
