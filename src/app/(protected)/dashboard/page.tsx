import { redirect } from 'next/navigation'
import { AtRiskEnterprises } from '@/components/dashboard/at-risk-enterprises'
import { ScoreDistributionChartLazy, StatusPieChartLazy } from '@/components/dashboard/charts-lazy'
import { RecentEnterprises } from '@/components/dashboard/recent-enterprises'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { createClient } from '@/lib/supabase/server'
import {
  getAtRiskEnterprises,
  getGlobalStats,
  getRecentEnterprises,
} from '@/repositories/stats.repository'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Charger toutes les données en parallèle
  const [stats, recentEnterprises, atRiskEnterprises] = await Promise.all([
    getGlobalStats(user.id),
    getRecentEnterprises(user.id, 15), // Plus que 5 maintenant
    getAtRiskEnterprises(user.id, 10),
  ])

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
