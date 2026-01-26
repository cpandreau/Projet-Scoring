'use client'

import { HelpCircle } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { YearScore } from '@/actions/score.actions'
import { AccessibleChart, CHART_ZONE_COLORS } from '@/components/ui/accessible-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from '@/components/ui/tooltip'

interface ScoreEvolutionChartProps {
  scoresParAnnee: YearScore[]
}

function getScoreZone(score: number): keyof typeof CHART_ZONE_COLORS {
  if (score >= 8) return 'success'
  if (score >= 6) return 'caution'
  if (score >= 4) return 'warning'
  return 'danger'
}

export function ScoreEvolutionChart({ scoresParAnnee }: ScoreEvolutionChartProps) {
  // Préparer les données pour le graphique
  const data = scoresParAnnee.map((yearScore) => {
    const zone = getScoreZone(yearScore.score.scoreGlobal)
    return {
      annee: yearScore.annee.toString(),
      score: yearScore.score.scoreGlobal,
      zone,
      color: CHART_ZONE_COLORS[zone],
    }
  })

  // Ne rien afficher si moins de 2 années
  if (data.length < 2) {
    return null
  }

  // Calculer la variation entre la première et la dernière année
  const firstScore = data[0].score
  const lastScore = data[data.length - 1].score
  const variation = lastScore - firstScore
  const variationPercent =
    firstScore !== 0 ? ((variation / Math.abs(firstScore)) * 100).toFixed(1) : '0'

  // Générer la description pour les lecteurs d'écran
  const evolutionText =
    variation >= 0
      ? `en hausse de ${variation.toFixed(1)} points (${variationPercent}%)`
      : `en baisse de ${Math.abs(variation).toFixed(1)} points (${variationPercent}%)`

  const description = `Évolution du score sur ${data.length} années, ${evolutionText}. ${data
    .map((d) => `${d.annee}: ${d.score.toFixed(1)}/10`)
    .join('. ')}.`

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between font-medium text-sm">
          <div className="flex items-center gap-1.5">
            <span>Évolution du score</span>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Informations sur le calcul du score"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">
                    Ces scores sont calculés <strong>hors ratios d&apos;évolution</strong> pour
                    permettre une comparaison équitable entre les années.
                  </p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Le score global inclut les ratios d&apos;évolution et reflète la santé complète.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <span
            className={`font-normal text-xs ${variation >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {variation >= 0 ? '+' : ''}
            {variation.toFixed(1)} pts ({variationPercent}%)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AccessibleChart title="Évolution du score" description={description} className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              accessibilityLayer
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="annee"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: 'currentColor', fontSize: 11 }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                className="text-muted-foreground"
                tickCount={6}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const item = payload[0].payload as (typeof data)[0]
                    return (
                      <div className="rounded-lg border bg-popover p-2 shadow-md">
                        <p className="font-medium text-popover-foreground text-sm">
                          Année {item.annee}
                        </p>
                        <p className="text-sm" style={{ color: item.color }}>
                          Score: {item.score.toFixed(1)}/10
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="score"
                  position="top"
                  formatter={(value) =>
                    typeof value === 'number' ? value.toFixed(1) : String(value)
                  }
                  className="fill-foreground font-medium text-xs"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AccessibleChart>
        {/* Légende explicative */}
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Scores par exercice (hors évolution, comparables entre années)
        </p>
      </CardContent>
    </Card>
  )
}
