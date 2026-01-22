"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GlobalStats } from "@/repositories/stats.repository";
import type { EnterpriseStatus } from "@/types";
import { STATUT_LABELS } from "@/types";

interface StatusPieChartProps {
  enterprisesByStatus: GlobalStats["enterprisesByStatus"];
}

// Couleurs cohérentes avec les badges de statut
const STATUS_COLORS: Record<EnterpriseStatus, string> = {
  brouillon: "rgb(156, 163, 175)",      // gray-400
  documents_uploades: "rgb(59, 130, 246)", // blue-500
  extrait: "rgb(234, 179, 8)",          // yellow-500
  valide: "rgb(34, 197, 94)",           // green-500
  analyse: "rgb(168, 85, 247)",         // purple-500
};

const STATUS_ORDER: EnterpriseStatus[] = [
  "brouillon",
  "documents_uploades",
  "extrait",
  "valide",
  "analyse",
];

export function StatusPieChart({ enterprisesByStatus }: StatusPieChartProps) {
  const data = STATUS_ORDER
    .map((status) => ({
      name: STATUT_LABELS[status],
      value: enterprisesByStatus[status],
      color: STATUS_COLORS[status],
    }))
    .filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Répartition par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Aucune entreprise
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Répartition par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value, name) => {
                  const numValue = typeof value === "number" ? value : 0;
                  return [
                    `${numValue} (${Math.round((numValue / total) * 100)}%)`,
                    name,
                  ];
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
