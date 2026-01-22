import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGlobalStats, getRecentEnterprises } from "@/repositories/stats.repository";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ScoreDistributionChart } from "@/components/dashboard/score-distribution-chart";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import { RecentEnterprises } from "@/components/dashboard/recent-enterprises";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [stats, recentEnterprises] = await Promise.all([
    getGlobalStats(user.id),
    getRecentEnterprises(user.id, 5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de vos analyses de défaillance
        </p>
      </div>

      {/* Stats cards */}
      <StatsCards stats={stats} />

      {/* Graphiques côte à côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScoreDistributionChart distribution={stats.scoreDistribution} />
        <StatusPieChart enterprisesByStatus={stats.enterprisesByStatus} />
      </div>

      {/* Entreprises récentes */}
      <RecentEnterprises enterprises={recentEnterprises} />
    </div>
  );
}
