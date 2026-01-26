import { cn } from '@/lib/utils'

interface ScoreBarGaugeProps {
  /** Score de 0 à 10 */
  score: number
  /** Classes CSS additionnelles */
  className?: string
  /** Afficher le score et label en dessous */
  showLabel?: boolean
}

/**
 * Jauge horizontale avec zones colorées (rouge/jaune/vert)
 * et marqueur de position du score
 */
export function ScoreBarGauge({ score, className, showLabel = true }: ScoreBarGaugeProps) {
  const scorePercent = Math.min(100, Math.max(0, (score / 10) * 100))

  const getZoneColor = (score: number) => {
    if (score >= 7) return 'text-green-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getZoneLabel = (score: number) => {
    if (score >= 7) return 'Bon'
    if (score >= 4) return 'Moyen'
    return 'Risqué'
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Gauge */}
      <div className="relative h-6 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {/* Color zones */}
        <div className="absolute inset-0 flex">
          <div className="w-[40%] bg-red-200 dark:bg-red-900/50" />
          <div className="w-[30%] bg-yellow-200 dark:bg-yellow-900/50" />
          <div className="w-[30%] bg-green-200 dark:bg-green-900/50" />
        </div>
        {/* Enterprise position marker */}
        <div
          className="absolute top-0 bottom-0 z-10 w-1.5 rounded-full bg-blue-600 shadow-lg"
          style={{ left: `calc(${scorePercent}% - 3px)` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-muted-foreground text-xs">
        <span>0 - Risqué</span>
        <span>4 - Moyen</span>
        <span>7 - Bon</span>
        <span>10</span>
      </div>

      {/* Score display */}
      {showLabel && (
        <div className="text-center">
          <span className={cn('font-bold text-3xl', getZoneColor(score))}>{score.toFixed(1)}</span>
          <span className="text-muted-foreground text-xl">/10</span>
          <p className={cn('mt-1 font-medium text-sm', getZoneColor(score))}>
            {getZoneLabel(score)}
          </p>
        </div>
      )}
    </div>
  )
}
