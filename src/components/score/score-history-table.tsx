"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoreHistoryEntry } from "@/repositories/score-history.repository";
import { ScoreHistoryDetail } from "./score-history-detail";

interface ScoreHistoryTableProps {
  history: ScoreHistoryEntry[];
  onDelete?: (scoreId: string) => void;
  isDeleting?: boolean;
}

function getScoreVariant(score: number | null): {
  className: string;
  label: string;
} {
  if (score === null) {
    return { className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", label: "-" };
  }
  if (score >= 8) {
    return { className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", label: score.toFixed(1) };
  }
  if (score >= 6) {
    return { className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", label: score.toFixed(1) };
  }
  if (score >= 4) {
    return { className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300", label: score.toFixed(1) };
  }
  return { className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", label: score.toFixed(1) };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ScoreHistoryTable({
  history,
  onDelete,
  isDeleting,
}: ScoreHistoryTableProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ScoreHistoryEntry | null>(null);

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Historique des calculs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun historique disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Historique des calculs ({history.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {expanded && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-center p-3 font-medium">Exercice</th>
                    <th className="text-center p-3 font-medium">Score</th>
                    <th className="text-center p-3 font-medium hidden sm:table-cell">Liq.</th>
                    <th className="text-center p-3 font-medium hidden sm:table-cell">Rent.</th>
                    <th className="text-center p-3 font-medium hidden md:table-cell">Solv.</th>
                    <th className="text-center p-3 font-medium hidden md:table-cell">Act.</th>
                    <th className="text-center p-3 font-medium hidden lg:table-cell">Évol.</th>
                    <th className="text-center p-3 font-medium w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => {
                    const globalVariant = getScoreVariant(entry.score_global);
                    const isLatest = index === 0;

                    return (
                      <tr
                        key={entry.id}
                        className={cn(
                          "border-b last:border-0 hover:bg-muted/50 transition-colors",
                          isLatest && "bg-primary/5"
                        )}
                      >
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatDate(entry.created_at)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(entry.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <span className="font-medium">{entry.annee_exercice}</span>
                        </td>
                        <td className="text-center p-3">
                          <Badge
                            className={cn(
                              "font-semibold tabular-nums",
                              globalVariant.className
                            )}
                          >
                            {globalVariant.label}
                          </Badge>
                        </td>
                        <td className="text-center p-3 hidden sm:table-cell">
                          <ScoreCell score={entry.score_liquidite} />
                        </td>
                        <td className="text-center p-3 hidden sm:table-cell">
                          <ScoreCell score={entry.score_rentabilite} />
                        </td>
                        <td className="text-center p-3 hidden md:table-cell">
                          <ScoreCell score={entry.score_solvabilite} />
                        </td>
                        <td className="text-center p-3 hidden md:table-cell">
                          <ScoreCell score={entry.score_activite} />
                        </td>
                        <td className="text-center p-3 hidden lg:table-cell">
                          <ScoreCell score={entry.score_evolution} />
                        </td>
                        <td className="text-center p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedEntry(entry)}
                              title="Voir le détail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(entry.id)}
                                disabled={isDeleting}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modal de détail */}
      <ScoreHistoryDetail
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  );
}

function ScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground">-</span>;
  }

  const variant = getScoreVariant(score);
  return (
    <span className={cn("text-xs font-medium", getTextColorClass(score))}>
      {score.toFixed(1)}
    </span>
  );
}

function getTextColorClass(score: number): string {
  if (score >= 8) return "text-green-600 dark:text-green-400";
  if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 4) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}
