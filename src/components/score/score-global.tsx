'use client'

import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getScoreZone, getZoneColors, getZoneTextClasses } from '@/config/colors.config'
import { interpretScore } from '@/lib/ratios'
import { cn } from '@/lib/utils'

interface ScoreGlobalProps {
  score: number
  ratiosExclus?: number
}

export function ScoreGlobal({ score, ratiosExclus = 0 }: ScoreGlobalProps) {
  const zone = getScoreZone(score)
  const colors = getZoneColors(zone)
  const interpretation = interpretScore(score)

  // Animation state
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Déclencher l'animation après le montage
    const timer = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Calcul pour l'arc SVG
  const size = 120
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Le score va de 0 à 10
  const percentage = Math.min(Math.max(score / 10, 0), 1)
  const targetOffset = circumference * (1 - percentage)

  // Offset animé : commence à 100%, finit à la valeur cible
  const currentOffset = animated ? targetOffset : circumference

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Cercle SVG avec jauge */}
      <div className="relative h-28 w-28 sm:h-36 sm:w-36">
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Cercle de fond (track) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />
          {/* Arc de progression */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={currentOffset}
            className={cn(
              colors.strokeClass,
              'transition-[stroke-dashoffset] duration-1000 ease-out'
            )}
          />
        </svg>

        {/* Score au centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold text-3xl sm:text-4xl', getZoneTextClasses(zone))}>
            {score.toFixed(1)}
          </span>
          <span className="text-muted-foreground text-sm">/10</span>
        </div>
      </div>

      {/* Label d'interprétation */}
      <p className={cn('font-medium text-sm', getZoneTextClasses(zone))}>{colors.label}</p>

      {/* Description détaillée */}
      <p className="max-w-50 text-center text-muted-foreground text-xs">
        {interpretation.description}
      </p>

      {/* Mention des ratios exclus */}
      {ratiosExclus > 0 && (
        <p className="mt-1 text-center text-[10px] text-muted-foreground/70">
          {ratiosExclus} ratio{ratiosExclus > 1 ? 's' : ''} non applicable
          {ratiosExclus > 1 ? 's' : ''} exclu{ratiosExclus > 1 ? 's' : ''} du calcul
        </p>
      )}

      {/* Mention explicative */}
      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground/70">
        <Info className="h-3 w-3" />
        <span>Score global incluant l&apos;évolution sur 3 ans</span>
      </div>
    </div>
  )
}
