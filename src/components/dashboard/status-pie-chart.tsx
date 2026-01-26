'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { AccessibleChart, CHART_ZONE_COLORS, ChartTooltip } from '@/components/ui/accessible-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GlobalStats } from '@/repositories/stats.repository'
import type { EnterpriseStatus } from '@/types'
import { STATUT_LABELS } from '@/types'

interface StatusPieChartProps {
  enterprisesByStatus: GlobalStats['enterprisesByStatus']
}

// Couleurs cohérentes avec les badges de statut
const STATUS_COLORS: Record<EnterpriseStatus, string> = {
  brouillon: CHART_ZONE_COLORS.neutral,
  documents_uploades: CHART_ZONE_COLORS.info,
  extrait: CHART_ZONE_COLORS.caution,
  valide: CHART_ZONE_COLORS.success,
  analyse: CHART_ZONE_COLORS.purple,
}

const STATUS_ORDER: EnterpriseStatus[] = [
  'brouillon',
  'documents_uploades',
  'extrait',
  'valide',
  'analyse',
]

export function StatusPieChart({ enterprisesByStatus }: StatusPieChartProps) {
  const data = STATUS_ORDER.map((status) => ({
    name: STATUT_LABELS[status],
    value: enterprisesByStatus[status],
    color: STATUS_COLORS[status],
  })).filter((d) => d.value > 0)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Générer la description pour les lecteurs d'écran
  const description = `Répartition par statut sur ${total} entreprise${total > 1 ? 's' : ''}. ${data
    .map((d) => {
      const percent = total > 0 ? Math.round((d.value / total) * 100) : 0
      return `${d.name}: ${d.value} (${percent}%)`
    })
    .join('. ')}.`

  if (total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-sm">Répartition par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            Aucune entreprise
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-sm">Répartition par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <AccessibleChart title="Répartition par statut" description={description} className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
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
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-foreground text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </AccessibleChart>
      </CardContent>
    </Card>
  )
}
