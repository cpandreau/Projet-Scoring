"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RATIO_FAMILIES, RATIOS, type FamilyId } from "@/config/ratios.config";
import type { ScoreHistoryEntry } from "@/repositories/score-history.repository";
import type { RatioDetail, Zone } from "@/lib/ratios";

interface ScoreHistoryDetailProps {
  entry: ScoreHistoryEntry | null;
  onClose: () => void;
}

const FAMILY_ORDER: FamilyId[] = [
  "liquidite",
  "rentabilite",
  "solvabilite",
  "activite",
  "evolution",
];

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-600 dark:text-green-400";
  if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 4) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBadgeClass(score: number): string {
  if (score >= 8) return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  if (score >= 6) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  if (score >= 4) return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
  return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
}

function getZoneColor(zone: Zone): string {
  switch (zone) {
    case "vert":
      return "text-green-600 dark:text-green-400";
    case "jaune":
      return "text-yellow-600 dark:text-yellow-400";
    case "rouge":
      return "text-red-600 dark:text-red-400";
  }
}

function getZoneBadgeClass(zone: Zone): string {
  switch (zone) {
    case "vert":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "jaune":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "rouge":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRatioValue(value: number | null, unite: string): string {
  if (value === null) return "-";

  switch (unite) {
    case "%":
      return `${value.toFixed(1)}%`;
    case "jours":
      return `${value.toFixed(0)} j`;
    case "ratio":
      return value.toFixed(2);
    default:
      return value.toFixed(2);
  }
}

export function ScoreHistoryDetail({ entry, onClose }: ScoreHistoryDetailProps) {
  if (!entry) return null;

  const detailRatios = entry.detail_ratios as Record<string, RatioDetail>;

  // Grouper les ratios par famille
  const ratiosByFamily: Record<FamilyId, RatioDetail[]> = {
    liquidite: [],
    rentabilite: [],
    solvabilite: [],
    activite: [],
    evolution: [],
  };

  for (const [ratioId, ratioDetail] of Object.entries(detailRatios)) {
    const ratioDef = RATIOS[ratioId];
    if (ratioDef) {
      ratiosByFamily[ratioDef.famille].push(ratioDetail);
    }
  }

  const getFamilyScore = (familyId: FamilyId): number | null => {
    switch (familyId) {
      case "liquidite":
        return entry.score_liquidite;
      case "rentabilite":
        return entry.score_rentabilite;
      case "solvabilite":
        return entry.score_solvabilite;
      case "activite":
        return entry.score_activite;
      case "evolution":
        return entry.score_evolution;
    }
  };

  return (
    <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Détail du score
            <Badge className={cn("ml-2", getScoreBadgeClass(entry.score_global))}>
              {entry.score_global.toFixed(1)}/10
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Calculé le {formatDate(entry.created_at)} - Exercice {entry.annee_exercice}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Résumé des scores par famille */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {FAMILY_ORDER.map((familyId) => {
              const family = RATIO_FAMILIES[familyId];
              const score = getFamilyScore(familyId);
              return (
                <div
                  key={familyId}
                  className="text-center p-2 rounded-lg bg-muted/50"
                >
                  <p className="text-xs text-muted-foreground truncate">
                    {family.nom}
                  </p>
                  <p
                    className={cn(
                      "font-semibold",
                      score !== null ? getScoreColor(score) : "text-muted-foreground"
                    )}
                  >
                    {score !== null ? score.toFixed(1) : "-"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Détail par famille */}
          {FAMILY_ORDER.map((familyId) => {
            const family = RATIO_FAMILIES[familyId];
            const familyRatios = ratiosByFamily[familyId];
            const familyScore = getFamilyScore(familyId);

            if (familyRatios.length === 0) return null;

            return (
              <Card key={familyId}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {family.nom}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({family.poids}%)
                      </span>
                    </CardTitle>
                    {familyScore !== null && (
                      <Badge
                        className={cn(
                          "text-xs",
                          getScoreBadgeClass(familyScore)
                        )}
                      >
                        {familyScore.toFixed(1)}/10
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <div className="space-y-1">
                    {familyRatios.map((ratio) => {
                      const ratioDef = RATIOS[ratio.id];
                      const unite = ratioDef?.unite || "%";

                      return (
                        <div
                          key={ratio.id}
                          className="flex items-center justify-between py-1.5 border-b last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" title={ratio.nom}>
                              {ratio.nom}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-2">
                            <span className="text-sm font-mono tabular-nums">
                              {formatRatioValue(ratio.valeur, unite)}
                            </span>
                            <Badge
                              className={cn(
                                "text-xs w-16 justify-center",
                                getZoneBadgeClass(ratio.zone)
                              )}
                            >
                              {ratio.zone === "vert"
                                ? "Bon"
                                : ratio.zone === "jaune"
                                ? "Moyen"
                                : "Risque"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
