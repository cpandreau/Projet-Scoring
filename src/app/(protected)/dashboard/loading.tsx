import { BarChart3, Building, FileText, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Données statiques des stats cards (identiques à stats-cards.tsx)
const STATS_CONFIG = [
  { label: 'Entreprises', icon: Building },
  { label: 'Documents', icon: FileText },
  { label: 'Analysées', icon: BarChart3 },
  { label: 'Score moyen', icon: TrendingUp },
] as const

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {/* Header - STATIQUE */}
      <div>
        <h1 className="font-bold text-2xl">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de vos analyses de défaillance</p>
      </div>

      {/* Stats Cards - Structure identique à stats-cards.tsx */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CONFIG.map((stat) => (
          <Card key={stat.label} className="py-4">
            <CardContent className="flex items-center gap-4">
              {/* Icône - STATIQUE */}
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                {/* Valeur - SKELETON */}
                <Skeleton className="h-8 w-12" />
                {/* Label - STATIQUE */}
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                {/* Sous-label - SKELETON */}
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques - Structure identique à la page */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Distribution des scores - titre identique à score-distribution-chart.tsx */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-sm">Distribution des scores</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
            {/* Légende statique */}
            <div className="mt-2 flex justify-center gap-4 text-muted-foreground text-xs">
              <span>&lt;4 = Risque</span>
              <span>4-6 = Moyen</span>
              <span>6-8 = Correct</span>
              <span>≥8 = Excellent</span>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par statut - titre identique à status-pie-chart.tsx */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-sm">Répartition par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Dossiers récents - Structure identique à recent-enterprises.tsx */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2 font-medium text-sm">
              <Building className="h-4 w-4" />
              Dossiers récents
            </CardTitle>
            <CardDescription className="mt-1">
              <Skeleton className="h-4 w-32" />
            </CardDescription>
          </div>
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 5 entreprises skeleton */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-l-4 border-l-muted bg-card p-3"
            >
              <div className="min-w-0 flex-1 pr-20">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-1 h-4 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
