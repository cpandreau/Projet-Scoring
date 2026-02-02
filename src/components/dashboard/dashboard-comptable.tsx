import { AtRiskEnterprises } from './at-risk-enterprises'
import { ScoreDistributionChartLazy, StatusPieChartLazy } from './charts-lazy'
import { RecentEnterprises } from './recent-enterprises'
import { StatsCards } from './stats-cards'
import type {
  AtRiskEnterprise,
  GlobalStats,
  RecentEnterprise,
} from '@/repositories/stats.repository'

interface DashboardComptableProps {
  stats: GlobalStats
  recentEnterprises: RecentEnterprise[]
  atRiskEnterprises: AtRiskEnterprise[]
}

export function DashboardComptable({
  stats,
  recentEnterprises,
  atRiskEnterprises,
}: DashboardComptableProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de vos analyses de défaillance</p>
      </div>

      {/* Stats cards */}
      <StatsCards stats={stats} />

      {/* Alertes : Entreprises à risque */}
      {atRiskEnterprises.length > 0 && <AtRiskEnterprises enterprises={atRiskEnterprises} />}

      {/* Graphiques côte à côte - lazy loaded */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ScoreDistributionChartLazy distribution={stats.scoreDistribution} />
        <StatusPieChartLazy enterprisesByStatus={stats.enterprisesByStatus} />
      </div>

      {/* Dossiers récents */}
      <RecentEnterprises enterprises={recentEnterprises} initialCount={5} maxCount={15} />
    </div>
  )
}
