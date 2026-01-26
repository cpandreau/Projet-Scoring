'use client'

import { ChevronDown, ChevronUp, History } from 'lucide-react'
import { memo, useState } from 'react'
import type { YearScore } from '@/actions/score.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ZoneBadge } from '@/components/ui/zone-badge'
import { getScoreZone, getZoneTextClasses } from '@/config/colors.config'
import { type FamilyId, getRatiosByFamily, RATIOS } from '@/config/ratios.config'
import type { ExcludedRatio, FamilyScore } from '@/lib/ratios'
import { ExcludedRatioItem } from './excluded-ratio-item'
import { FamilleEvolutionTable } from './famille-evolution-table'

interface ScoreFamilleProps {
  familyScore: FamilyScore
  scoresParAnnee?: YearScore[]
  excludedRatios?: ExcludedRatio[]
}

function formatValue(value: number | null, unite: string): string {
  if (value === null || !Number.isFinite(value)) return 'N/A'

  switch (unite) {
    case '%':
      return `${value.toFixed(1)}%`
    case 'jours':
      return `${Math.round(value)} j`
    case 'ratio':
      return value.toFixed(2)
    default:
      return value.toFixed(2)
  }
}

export const ScoreFamille = memo(function ScoreFamille({
  familyScore,
  scoresParAnnee,
  excludedRatios = [],
}: ScoreFamilleProps) {
  const [showEvolution, setShowEvolution] = useState(false)
  const { id, nom, poids, score, ratios } = familyScore
  const scoreZone = getScoreZone(score)

  const hasMultiYearData = scoresParAnnee && scoresParAnnee.length > 1

  // Filtrer les ratios exclus appartenant à cette famille
  const familyRatioIds = getRatiosByFamily(id as FamilyId).map((r) => r.id)
  const familyExcludedRatios = excludedRatios.filter((e) => familyRatioIds.includes(e.key))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{nom}</CardTitle>
            <CardDescription>Pondération : {poids}%</CardDescription>
          </div>
          <div className={`font-bold text-2xl ${getZoneTextClasses(scoreZone)}`}>
            {score.toFixed(1)}/10
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {ratios.map((ratio) => {
            const ratioDef = RATIOS[ratio.id]
            const unite = ratioDef?.unite ?? '%'

            return (
              <li key={ratio.id} className="flex items-center justify-between text-sm">
                <span className="mr-2 truncate text-muted-foreground">{ratio.nom}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-foreground tabular-nums">
                    {formatValue(ratio.valeur, unite)}
                  </span>
                  <ZoneBadge zone={ratio.zone} label={ratio.zone} size="sm" />
                </div>
              </li>
            )
          })}
        </ul>

        {hasMultiYearData && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => setShowEvolution(!showEvolution)}
            >
              <History className="mr-2 h-4 w-4" />
              Voir l&apos;évolution
              {showEvolution ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>

            {showEvolution && (
              <FamilleEvolutionTable familyId={id as FamilyId} scoresParAnnee={scoresParAnnee} />
            )}
          </>
        )}

        {/* Section des ratios exclus */}
        {familyExcludedRatios.length > 0 && (
          <div className="mt-2 border-t pt-3">
            <p className="mb-2 text-muted-foreground text-xs">
              Ratios non applicables ({familyExcludedRatios.length})
            </p>
            <div className="space-y-1">
              {familyExcludedRatios.map((excluded) => (
                <ExcludedRatioItem key={excluded.key} excluded={excluded} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

ScoreFamille.displayName = 'ScoreFamille'
