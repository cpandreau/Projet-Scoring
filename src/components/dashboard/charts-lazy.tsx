'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Skeleton pour les graphiques
function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  )
}

// Lazy load ScoreDistributionChart
export const ScoreDistributionChartLazy = dynamic(
  () => import('./score-distribution-chart').then((mod) => mod.ScoreDistributionChart),
  {
    loading: () => <ChartSkeleton title="Distribution des scores" />,
    ssr: false,
  }
)

// Lazy load StatusPieChart
export const StatusPieChartLazy = dynamic(
  () => import('./status-pie-chart').then((mod) => mod.StatusPieChart),
  {
    loading: () => <ChartSkeleton title="Répartition par statut" />,
    ssr: false,
  }
)
