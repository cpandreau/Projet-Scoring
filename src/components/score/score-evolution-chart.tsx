"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { YearScore } from "@/actions/score.actions";
import { getScoreZone, getZoneColors } from "@/config/colors.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ScoreEvolutionChartProps {
  scoresParAnnee: YearScore[];
}

export function ScoreEvolutionChart({ scoresParAnnee }: ScoreEvolutionChartProps) {
  // Préparer les données pour le graphique
  const data = scoresParAnnee.map((yearScore) => {
    const zone = getScoreZone(yearScore.score.scoreGlobal);
    const colors = getZoneColors(zone);
    return {
      annee: yearScore.annee.toString(),
      score: yearScore.score.scoreGlobal,
      fill: colors.stroke,
    };
  });

  // Ne rien afficher si moins de 2 années
  if (data.length < 2) {
    return null;
  }

  // Calculer la variation entre la première et la dernière année
  const firstScore = data[0].score;
  const lastScore = data[data.length - 1].score;
  const variation = lastScore - firstScore;
  const variationPercent = firstScore !== 0
    ? ((variation / Math.abs(firstScore)) * 100).toFixed(1)
    : "0";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>Évolution du score</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">
                    Ces scores sont calculés <strong>hors ratios d&apos;évolution</strong> pour
                    permettre une comparaison équitable entre les années.
                  </p>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Le score global inclut les ratios d&apos;évolution et reflète la santé complète.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className={`text-xs font-normal ${variation >= 0 ? "text-green-600" : "text-red-600"}`}>
            {variation >= 0 ? "+" : ""}{variation.toFixed(1)} pts ({variationPercent}%)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="annee"
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-muted-foreground"
                tickCount={6}
              />
              <Bar
                dataKey="score"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="score"
                  position="top"
                  formatter={(value) => typeof value === "number" ? value.toFixed(1) : value}
                  className="fill-foreground text-xs font-medium"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Légende explicative */}
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Scores par exercice (hors évolution, comparables entre années)
        </p>
      </CardContent>
    </Card>
  );
}
