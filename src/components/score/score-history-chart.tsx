"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreHistoryEntry } from "@/repositories/score-history.repository";

interface ScoreHistoryChartProps {
  history: ScoreHistoryEntry[];
}

function getScoreColor(score: number): string {
  if (score >= 8) return "rgb(34, 197, 94)"; // green-500
  if (score >= 6) return "rgb(234, 179, 8)"; // yellow-500
  if (score >= 4) return "rgb(249, 115, 22)"; // orange-500
  return "rgb(239, 68, 68)"; // red-500
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  score: number;
  anneeExercice: number;
  color: string;
}

export function ScoreHistoryChart({ history }: ScoreHistoryChartProps) {
  const chartData = useMemo((): ChartDataPoint[] => {
    // Trier par date (plus ancien en premier pour le graphique)
    const sorted = [...history].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return sorted.map((entry) => ({
      date: entry.created_at,
      dateLabel: formatDate(entry.created_at),
      score: entry.score_global,
      anneeExercice: entry.annee_exercice,
      color: getScoreColor(entry.score_global),
    }));
  }, [history]);

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Évolution du score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Aucun historique disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 1) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Évolution du score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Un seul calcul enregistré. Recalculez le score pour voir l&apos;évolution.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Évolution du score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: "currentColor", fontSize: 10 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fill: "currentColor", fontSize: 10 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={25}
              />
              {/* Lignes de référence pour les zones */}
              <ReferenceLine y={4} stroke="rgb(239, 68, 68)" strokeDasharray="3 3" strokeOpacity={0.3} />
              <ReferenceLine y={6} stroke="rgb(234, 179, 8)" strokeDasharray="3 3" strokeOpacity={0.3} />
              <ReferenceLine y={8} stroke="rgb(34, 197, 94)" strokeDasharray="3 3" strokeOpacity={0.3} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload as ChartDataPoint;
                    return (
                      <div className="bg-popover border rounded-lg p-2 shadow-md">
                        <p className="text-xs text-muted-foreground">
                          {new Date(data.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="font-semibold" style={{ color: data.color }}>
                          Score: {data.score.toFixed(1)}/10
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Exercice {data.anneeExercice}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={({ cx, cy, payload }) => {
                  const data = payload as ChartDataPoint;
                  return (
                    <circle
                      key={data.date}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={data.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            &lt;4
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            4-6
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            6-8
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            ≥8
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
