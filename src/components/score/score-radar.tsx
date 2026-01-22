"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type { FamilyScore } from "@/lib/ratios";
import type { FamilyId } from "@/config/ratios.config";
import { getScoreZone, getZoneColors } from "@/config/colors.config";

interface ScoreRadarProps {
  scoreParFamille: Record<FamilyId, FamilyScore>;
  scoreGlobal: number;
}

// Ordre des familles pour le radar
const FAMILY_ORDER: FamilyId[] = [
  "liquidite",
  "rentabilite",
  "solvabilite",
  "activite",
  "evolution",
];

// Labels courts pour le radar
const FAMILY_LABELS: Record<FamilyId, string> = {
  liquidite: "Liquidité",
  rentabilite: "Rentabilité",
  solvabilite: "Solvabilité",
  activite: "Activité",
  evolution: "Évolution",
};

export function ScoreRadar({ scoreParFamille, scoreGlobal }: ScoreRadarProps) {
  // Préparer les données pour le radar
  const data = FAMILY_ORDER.map((familyId) => ({
    famille: FAMILY_LABELS[familyId],
    score: scoreParFamille[familyId]?.score ?? 0,
    fullMark: 10,
  }));

  // Utiliser les couleurs centralisées
  const zone = getScoreZone(scoreGlobal);
  const colors = getZoneColors(zone);

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid
            stroke="currentColor"
            className="text-muted-foreground/20"
          />
          <PolarAngleAxis
            dataKey="famille"
            tick={{ fill: "currentColor", fontSize: 11 }}
            className="text-muted-foreground"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "currentColor", fontSize: 9 }}
            className="text-muted-foreground"
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={colors.stroke}
            fill={colors.fill}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
