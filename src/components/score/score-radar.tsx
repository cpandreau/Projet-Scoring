'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { AccessibleChart } from '@/components/ui/accessible-chart'
import { getScoreZone, getZoneColors } from '@/config/colors.config'
import type { FamilyId } from '@/config/ratios.config'
import type { FamilyScore } from '@/lib/ratios'

interface ScoreRadarProps {
  scoreParFamille: Record<FamilyId, FamilyScore>
  scoreGlobal: number
}

// Ordre des familles pour le radar
const FAMILY_ORDER: FamilyId[] = [
  'liquidite',
  'rentabilite',
  'solvabilite',
  'activite',
  'evolution',
]

// Labels courts pour le radar
const FAMILY_LABELS: Record<FamilyId, string> = {
  liquidite: 'Liquidité',
  rentabilite: 'Rentabilité',
  solvabilite: 'Solvabilité',
  activite: 'Activité',
  evolution: 'Évolution',
}

export function ScoreRadar({ scoreParFamille, scoreGlobal }: ScoreRadarProps) {
  // Préparer les données pour le radar
  const data = FAMILY_ORDER.map((familyId) => ({
    famille: FAMILY_LABELS[familyId],
    familyId,
    score: scoreParFamille[familyId]?.score ?? 0,
    fullMark: 10,
  }))

  // Utiliser les couleurs centralisées
  const zone = getScoreZone(scoreGlobal)
  const colors = getZoneColors(zone)

  // Générer la description pour les lecteurs d'écran
  const description = `Radar des scores par famille pour un score global de ${scoreGlobal.toFixed(1)}/10. ${data
    .map((d) => `${d.famille}: ${d.score.toFixed(1)}/10`)
    .join('. ')}.`

  return (
    <AccessibleChart
      title="Score par famille"
      description={description}
      className="h-64 w-full sm:h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data} accessibilityLayer>
          <PolarGrid stroke="currentColor" className="text-muted-foreground/20" />
          <PolarAngleAxis
            dataKey="famille"
            tick={{ fill: 'currentColor', fontSize: 11 }}
            className="text-muted-foreground"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: 'currentColor', fontSize: 9 }}
            className="text-muted-foreground"
            tickCount={6}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const item = payload[0].payload as (typeof data)[0]
                return (
                  <div className="rounded-lg border bg-popover p-2 shadow-md">
                    <p className="font-medium text-popover-foreground text-sm">{item.famille}</p>
                    <p className="text-popover-foreground text-sm">
                      Score: {item.score.toFixed(1)}/10
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={colors.stroke}
            fill={colors.fill}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </AccessibleChart>
  )
}
