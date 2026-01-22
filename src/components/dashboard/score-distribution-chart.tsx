"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GlobalStats } from "@/repositories/stats.repository";

interface ScoreDistributionChartProps {
  distribution: GlobalStats["scoreDistribution"];
}

const CATEGORIES = [
  { key: "critical", label: "Risque", color: "rgb(239, 68, 68)" },      // red-500
  { key: "warning", label: "Moyen", color: "rgb(249, 115, 22)" },       // orange-500
  { key: "good", label: "Correct", color: "rgb(234, 179, 8)" },         // yellow-500
  { key: "excellent", label: "Excellent", color: "rgb(34, 197, 94)" },  // green-500
] as const;

export function ScoreDistributionChart({ distribution }: ScoreDistributionChartProps) {
  const data = CATEGORIES.map(({ key, label, color }) => ({
    name: label,
    value: distribution[key],
    color,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Distribution des scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Aucune entreprise analysée
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Distribution des scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <XAxis
                type="number"
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-muted-foreground"
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-muted-foreground"
                width={55}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  className="fill-foreground text-xs font-medium"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>&lt;4 = Risque</span>
          <span>4-6 = Moyen</span>
          <span>6-8 = Correct</span>
          <span>≥8 = Excellent</span>
        </div>
      </CardContent>
    </Card>
  );
}
