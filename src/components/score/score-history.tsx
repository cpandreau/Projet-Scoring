"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteScoreHistory } from "@/actions/score-history.actions";
import { calculateEnterpriseScore } from "@/actions/score.actions";
import { showSuccess, showError } from "@/lib/toast";
import type { ScoreHistoryEntry } from "@/repositories/score-history.repository";
import { ScoreHistoryChart } from "./score-history-chart";
import { ScoreHistoryTable } from "./score-history-table";
import { Button } from "@/components/ui/button";
import { History, RefreshCw, Loader2 } from "lucide-react";

interface ScoreHistoryProps {
  enterpriseId: string;
  history: ScoreHistoryEntry[];
}

export function ScoreHistory({ enterpriseId, history }: ScoreHistoryProps) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleDelete = (scoreId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet historique de score ?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteScoreHistory(scoreId);

      if (result.success) {
        showSuccess("Supprimé", "L'entrée d'historique a été supprimée");
        router.refresh();
      } else {
        showError("Erreur", result.error || "Impossible de supprimer");
      }
    });
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const result = await calculateEnterpriseScore(enterpriseId);

      if (result.success) {
        showSuccess("Recalculé", "Le score a été recalculé et l'historique mis à jour");
        router.refresh();
      } else {
        showError("Erreur", result.error || "Erreur lors du recalcul");
      }
    } catch (error) {
      console.error("Erreur recalcul:", error);
      showError("Erreur", "Une erreur est survenue lors du recalcul");
    } finally {
      setIsRecalculating(false);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Historique des scores</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecalculate}
          disabled={isRecalculating}
        >
          {isRecalculating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Recalcul...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalculer
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScoreHistoryChart history={history} />
        <div className="lg:col-span-1">
          {/* Placeholder pour d'autres statistiques si nécessaire */}
        </div>
      </div>

      <ScoreHistoryTable
        history={history}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
