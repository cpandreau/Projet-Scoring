import { BarChart3, Building, FileText, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { GlobalStats } from '@/repositories/stats.repository'

interface StatsCardsProps {
  stats: GlobalStats
}

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  sublabel?: string
  className?: string
}

function StatCard({ icon, value, label, sublabel, className }: StatCardProps) {
  return (
    <Card className={cn('py-4', className)}>
      <CardContent className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
        <div>
          <p className="font-bold text-2xl tabular-nums">{value}</p>
          <p className="text-muted-foreground text-sm">{label}</p>
          {sublabel && <p className="text-muted-foreground/70 text-xs">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards({ stats }: StatsCardsProps) {
  const averageScoreDisplay = stats.averageScore !== null ? stats.averageScore.toFixed(1) : '—'

  const averageSublabel =
    stats.averageScore !== null
      ? `sur ${stats.analyzedEnterprises} entreprise${stats.analyzedEnterprises > 1 ? 's' : ''}`
      : 'Aucune analyse'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Building className="h-5 w-5" />}
        value={stats.totalEnterprises}
        label="Entreprises"
        sublabel={
          stats.totalEnterprises > 0
            ? `${stats.enterprisesByStatus.brouillon} en brouillon`
            : undefined
        }
      />
      <StatCard
        icon={<FileText className="h-5 w-5" />}
        value={stats.totalDocuments}
        label="Documents"
        sublabel={
          stats.documentsValidated > 0
            ? `${stats.documentsValidated} validé${stats.documentsValidated > 1 ? 's' : ''}`
            : undefined
        }
      />
      <StatCard
        icon={<BarChart3 className="h-5 w-5" />}
        value={stats.analyzedEnterprises}
        label="Analysées"
        sublabel={
          stats.totalEnterprises > 0
            ? `${Math.round((stats.analyzedEnterprises / stats.totalEnterprises) * 100)}% du total`
            : undefined
        }
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        value={averageScoreDisplay}
        label="Score moyen"
        sublabel={averageSublabel}
      />
    </div>
  )
}
