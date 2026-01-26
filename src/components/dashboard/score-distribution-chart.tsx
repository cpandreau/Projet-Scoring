'use client'

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AccessibleChart, CHART_ZONE_COLORS, ChartTooltip } from '@/components/ui/accessible-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GlobalStats } from '@/repositories/stats.repository'

interface ScoreDistributionChartProps {
  distribution: GlobalStats['scoreDistribution']
}

const CATEGORIES = [
  { key: 'critical', label: 'Risque', zone: 'danger' },
  { key: 'warning', label: 'Moyen', zone: 'warning' },
  { key: 'good', label: 'Correct', zone: 'caution' },
  { key: 'excellent', label: 'Excellent', zone: 'success' },
] as const

export function ScoreDistributionChart({ distribution }: ScoreDistributionChartProps) {
  const data = CATEGORIES.map(({ key, label, zone }) => ({
    name: label,
    value: distribution[key],
    zone,
    color: CHART_ZONE_COLORS[zone],
  }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Générer la description pour les lecteurs d'écran
  const description = `Distribution des scores de défaillance sur ${total} entreprise${total > 1 ? 's' : ''}. ${data
    .filter((d) => d.value > 0)
    .map((d) => `${d.name}: ${d.value} entreprise${d.value > 1 ? 's' : ''}`)
    .join('. ')}.`

  if (total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-sm">Distribution des scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            Aucune entreprise analysée
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-sm">Distribution des scores</CardTitle>
      </CardHeader>
      <CardContent>
        <AccessibleChart title="Distribution des scores" description={description} className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              accessibilityLayer
            >
              <XAxis
                type="number"
                tick={{ fill: 'currentColor', fontSize: 11 }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                className="text-muted-foreground"
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                className="text-muted-foreground"
                width={55}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(value, name) => {
                      const percent = total > 0 ? Math.round((value / total) * 100) : 0
                      return (
                        <span>
                          {name}: {value} ({percent}%)
                        </span>
                      )
                    }}
                  />
                }
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  className="fill-foreground font-medium text-xs"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AccessibleChart>
        <div className="mt-2 flex justify-center gap-4 text-muted-foreground text-xs">
          <span>&lt;4 = Risque</span>
          <span>4-6 = Moyen</span>
          <span>6-8 = Correct</span>
          <span>≥8 = Excellent</span>
        </div>
      </CardContent>
    </Card>
  )
}
