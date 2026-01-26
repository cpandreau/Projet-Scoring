'use client'

import { useMemo } from 'react'
import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AccessibleChart, CHART_ZONE_COLORS } from '@/components/ui/accessible-chart'

interface ChartDataItem {
  annee: string
  creations: number
}

interface CreationsEvolutionChartProps {
  chartData: ChartDataItem[]
  selectedYear: number | null | undefined
}

export function CreationsEvolutionChart({ chartData, selectedYear }: CreationsEvolutionChartProps) {
  // Calculer la moyenne mobile pour la ligne de tendance
  const dataWithTrend = useMemo(() => {
    return chartData.map((d, i, arr) => {
      // Moyenne mobile sur 3 points (ou moins au début)
      const windowSize = Math.min(3, i + 1)
      const window = arr.slice(Math.max(0, i - windowSize + 1), i + 1)
      const trend = window.reduce((sum, item) => sum + item.creations, 0) / window.length
      return {
        ...d,
        trend: Math.round(trend),
      }
    })
  }, [chartData])

  // Générer la description pour les lecteurs d'écran
  const total = chartData.reduce((sum, d) => sum + d.creations, 0)
  const description = `Évolution des créations d'entreprises sur ${chartData.length} années. Total: ${total.toLocaleString('fr-FR')} créations. ${chartData
    .map((d) => `${d.annee}: ${d.creations.toLocaleString('fr-FR')}`)
    .join('. ')}.${selectedYear ? ` Année sélectionnée: ${selectedYear}.` : ''}`

  return (
    <AccessibleChart title="Évolution des créations d'entreprises" description={description}>
      <ResponsiveContainer width="100%" height={150}>
        <ComposedChart
          data={dataWithTrend}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          accessibilityLayer
        >
          <XAxis
            dataKey="annee"
            tick={{ fill: 'currentColor', fontSize: 11 }}
            tickLine={{ stroke: 'currentColor' }}
            axisLine={{ stroke: 'currentColor' }}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fill: 'currentColor', fontSize: 11 }}
            tickLine={{ stroke: 'currentColor' }}
            axisLine={{ stroke: 'currentColor' }}
            className="text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length > 0) {
                const creations = payload[0]?.value as number
                return (
                  <div className="rounded-lg border bg-popover p-2 shadow-md">
                    <p className="font-medium text-popover-foreground text-sm">Année {label}</p>
                    <p className="text-popover-foreground text-sm">
                      Créations: {creations?.toLocaleString('fr-FR')}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="creations" radius={[4, 4, 0, 0]} name="Créations">
            {dataWithTrend.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.annee === selectedYear?.toString()
                    ? CHART_ZONE_COLORS.info
                    : CHART_ZONE_COLORS.neutral
                }
              />
            ))}
          </Bar>
          {/* Ligne de tendance */}
          <Line
            type="monotone"
            dataKey="trend"
            stroke={CHART_ZONE_COLORS.warning}
            strokeWidth={2}
            dot={false}
            name="Tendance"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </AccessibleChart>
  )
}
