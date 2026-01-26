import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import type { YearScore } from '@/actions/score.actions'
import { type FamilyId, RATIOS } from '@/config/ratios.config'
import { cn } from '@/lib/utils'

interface FamilleEvolutionTableProps {
  familyId: FamilyId
  scoresParAnnee: YearScore[]
}

function formatValue(value: number | null, unite: string): string {
  if (value === null || !Number.isFinite(value)) return '-'

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

function TrendIndicator({
  current,
  previous,
}: {
  current: number | null
  previous: number | null
}) {
  if (current === null || previous === null) {
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const diff = current - previous
  const threshold = 0.5 // Seuil pour considérer un changement significatif

  if (Math.abs(diff) < threshold) {
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  // Pour certains ratios, une hausse est négative (ex: taux d'endettement, délais)
  // On considère qu'une hausse est positive par défaut
  if (diff > 0) {
    return <TrendingUp className="h-4 w-4 text-green-500" />
  }

  return <TrendingDown className="h-4 w-4 text-red-500" />
}

export function FamilleEvolutionTable({ familyId, scoresParAnnee }: FamilleEvolutionTableProps) {
  if (scoresParAnnee.length < 2) {
    return (
      <p className="py-4 text-center text-muted-foreground text-sm">
        Données multi-années non disponibles
      </p>
    )
  }

  // Obtenir les ratios de la famille pour l'année la plus récente
  const latestYear = scoresParAnnee[scoresParAnnee.length - 1]
  const familyScore = latestYear.score.scoreParFamille[familyId]

  if (!familyScore) {
    return null
  }

  // Construire un map des valeurs par ratio et par année
  const valuesByRatioAndYear = new Map<string, Map<number, number | null>>()

  for (const yearScore of scoresParAnnee) {
    const family = yearScore.score.scoreParFamille[familyId]
    if (family) {
      for (const ratio of family.ratios) {
        if (!valuesByRatioAndYear.has(ratio.id)) {
          valuesByRatioAndYear.set(ratio.id, new Map())
        }
        valuesByRatioAndYear.get(ratio.id)?.set(yearScore.annee, ratio.valeur)
      }
    }
  }

  // Trier les années par ordre croissant
  const sortedYears = scoresParAnnee.map((y) => y.annee).sort((a, b) => a - b)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4 text-left font-medium text-muted-foreground">Ratio</th>
            {sortedYears.map((year) => (
              <th
                key={year}
                className="min-w-[70px] px-2 py-2 text-right font-medium text-muted-foreground"
              >
                {year}
              </th>
            ))}
            <th className="w-12 py-2 pl-2 text-center font-medium text-muted-foreground">Tend.</th>
          </tr>
        </thead>
        <tbody>
          {familyScore.ratios.map((ratio) => {
            const ratioDef = RATIOS[ratio.id]
            const unite = ratioDef?.unite ?? '%'
            const valuesMap = valuesByRatioAndYear.get(ratio.id)

            // Valeur actuelle et précédente pour la tendance
            const currentValue = valuesMap?.get(sortedYears[sortedYears.length - 1]) ?? null
            const previousValue =
              sortedYears.length > 1
                ? (valuesMap?.get(sortedYears[sortedYears.length - 2]) ?? null)
                : null

            return (
              <tr key={ratio.id} className="border-muted/50 border-b">
                <td className="max-w-[150px] truncate py-2 pr-4 text-muted-foreground">
                  {ratio.nom}
                </td>
                {sortedYears.map((year) => {
                  const value = valuesMap?.get(year) ?? null
                  return (
                    <td
                      key={year}
                      className={cn(
                        'px-2 py-2 text-right tabular-nums',
                        year === sortedYears[sortedYears.length - 1]
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formatValue(value, unite)}
                    </td>
                  )
                })}
                <td className="py-2 pl-2 text-center">
                  <TrendIndicator current={currentValue} previous={previousValue} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
