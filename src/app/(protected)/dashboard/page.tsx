import { redirect } from 'next/navigation'
import { getDirigeantDashboardData } from '@/actions/dirigeant-dashboard.actions'
import { DashboardComptable } from '@/components/dashboard/dashboard-comptable'
import { DashboardDirigeant } from '@/components/dashboard/dashboard-dirigeant'
import { getUserWithProfile } from '@/lib/auth'
import {
  getAtRiskEnterprises,
  getGlobalStats,
  getRecentEnterprises,
} from '@/repositories/stats.repository'

export default async function DashboardPage() {
  const result = await getUserWithProfile()

  if (!result) {
    redirect('/connexion')
  }

  const { user, profile } = result

  // Dashboard Dirigeant
  if (profile.userType === 'dirigeant') {
    const dashboardData = await getDirigeantDashboardData()

    return <DashboardDirigeant email={user.email} data={dashboardData} />
  }

  // Dashboard Comptable (existant)
  const [stats, recentEnterprises, atRiskEnterprises] = await Promise.all([
    getGlobalStats(user.id),
    getRecentEnterprises(user.id, 15),
    getAtRiskEnterprises(user.id, 10),
  ])

  return (
    <DashboardComptable
      stats={stats}
      recentEnterprises={recentEnterprises}
      atRiskEnterprises={atRiskEnterprises}
    />
  )
}
