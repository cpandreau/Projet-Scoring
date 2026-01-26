'use client'

import { useMemo } from 'react'
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AccessibleChart, CHART_ZONE_COLORS } from '@/components/ui/accessible-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ScoreHistoryEntry } from '@/repositories/score-history.repository'

interface ScoreHistoryChartProps {
  history: ScoreHistoryEntry[]
}

function getScoreZone(score: number): keyof typeof CHART_ZONE_COLORS {
  if (score >= 8) return 'success'
  if (score >= 6) return 'caution'
  if (score >= 4) return 'warning'
  return 'danger'
}

interface ChartDataPoint {
  date: string
  anneeExercice: number
  score: number
  zone: keyof typeof CHART_ZONE_COLORS
  color: string
}

export function ScoreHistoryChart({ history }: ScoreHistoryChartProps) {
  const chartData = useMemo((): ChartDataPoint[] => {
    // Trier par année d'exercice (plus ancien en premier)
    const sorted = [...history].sort((a, b) => a.annee_exercice - b.annee_exercice)

    return sorted.map((entry) => {
      const zone = getScoreZone(entry.score_global)
      return {
        date: entry.created_at,
        anneeExercice: entry.annee_exercice,
        score: entry.score_global,
        zone,
        color: CHART_ZONE_COLORS[zone],
      }
    })
  }, [history])

  // Générer la description pour les lecteurs d'écran
  const description = useMemo(() => {
    if (history.length === 0) return 'Aucun historique de score disponible.'
    if (history.length === 1) return 'Un seul calcul de score enregistré.'

    const firstScore = chartData[0]
    const lastScore = chartData[chartData.length - 1]
    const evolution = lastScore.score - firstScore.score
    const evolutionText =
      evolution >= 0
        ? `en hausse de ${evolution.toFixed(1)} points`
        : `en baisse de ${Math.abs(evolution).toFixed(1)} points`

    return `Évolution du score sur ${chartData.length} exercices, de ${firstScore.anneeExercice} à ${lastScore.anneeExercice}. Score ${evolutionText}. ${chartData.map((d) => `${d.anneeExercice}: ${d.score.toFixed(1)}/10`).join('. ')}.`
  }, [chartData, history.length])

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-sm">Historique des scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            Aucun historique disponible
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 1) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-sm">Historique des scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            Un seul calcul enregistré. Recalculez le score pour voir l&apos;évolution.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-sm">Historique des scores</CardTitle>
      </CardHeader>
      <CardContent>
        <AccessibleChart title="Historique des scores" description={description} className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              accessibilityLayer
            >
              <XAxis
                dataKey="anneeExercice"
                tick={{ fill: 'currentColor', fontSize: 10 }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fill: 'currentColor', fontSize: 10 }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                className="text-muted-foreground"
                width={25}
              />
              {/* Lignes de référence pour les zones */}
              <ReferenceLine
                y={4}
                stroke={CHART_ZONE_COLORS.danger}
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
              <ReferenceLine
                y={6}
                stroke={CHART_ZONE_COLORS.caution}
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
              <ReferenceLine
                y={8}
                stroke={CHART_ZONE_COLORS.success}
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload as ChartDataPoint
                    return (
                      <div className="rounded-lg border bg-popover p-2 shadow-md">
                        <p className="font-medium text-popover-foreground text-sm">
                          Exercice {data.anneeExercice}
                        </p>
                        <p className="text-sm" style={{ color: data.color }}>
                          Score: {data.score.toFixed(1)}/10
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={CHART_ZONE_COLORS.info}
                strokeWidth={2}
                dot={({ cx, cy, payload }) => {
                  const data = payload as ChartDataPoint
                  return (
                    <circle
                      key={data.anneeExercice}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={data.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AccessibleChart>
        <div className="mt-2 flex justify-center gap-3 text-muted-foreground text-xs">
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_ZONE_COLORS.danger }}
            />
            &lt;4
          </span>
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_ZONE_COLORS.warning }}
            />
            4-6
          </span>
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_ZONE_COLORS.caution }}
            />
            6-8
          </span>
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_ZONE_COLORS.success }}
            />
            ≥8
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
