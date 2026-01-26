import { Calculator } from 'lucide-react'

import type { EnterpriseScoreResult } from '@/actions/score.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RATIO_FAMILIES } from '@/config/ratios.config'
import { cn } from '@/lib/utils'

import { FAMILY_ORDER } from './config'

interface ScoreBreakdownProps {
  scoreResult: EnterpriseScoreResult
}

/**
 * Section affichant la décomposition du score par famille de ratios
 */
export function ScoreBreakdown({ scoreResult }: ScoreBreakdownProps) {
  if (!scoreResult.score) return null

  const { scoreGlobal, scoreParFamille } = scoreResult.score

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          Détail du score de santé financière
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground text-sm">
          Score calculé à partir des ratios financiers extraits de la liasse fiscale
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium">Famille de ratios</th>
                <th className="py-2 text-right font-medium">Pondération</th>
                <th className="py-2 text-right font-medium">Score</th>
                <th className="py-2 text-right font-medium">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {FAMILY_ORDER.map((familyId) => {
                const family = RATIO_FAMILIES[familyId]
                const familyScore = scoreParFamille[familyId]
                const score = familyScore?.score ?? 0
                const contribution = (score * family.poids) / 100

                return (
                  <tr key={familyId} className="border-b">
                    <td className="py-2">{family.nom}</td>
                    <td className="py-2 text-right">{family.poids}%</td>
                    <td className="py-2 text-right">
                      <span
                        className={cn(
                          'font-medium',
                          score >= 7
                            ? 'text-green-600'
                            : score >= 4
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        )}
                      >
                        {score.toFixed(1)}/10
                      </span>
                    </td>
                    <td className="py-2 text-right">{contribution.toFixed(2)}</td>
                  </tr>
                )
              })}
              <tr className="bg-muted/50 font-bold">
                <td className="py-2">TOTAL</td>
                <td className="py-2 text-right">100%</td>
                <td className="py-2 text-right"></td>
                <td className="py-2 text-right">
                  <span
                    className={cn(
                      scoreGlobal >= 7
                        ? 'text-green-600'
                        : scoreGlobal >= 4
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    )}
                  >
                    {scoreGlobal.toFixed(1)}/10
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
