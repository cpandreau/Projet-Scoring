"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ScoreResult } from "@/lib/ratios";
import type { YearScore } from "@/actions/score.actions";
import type { FamilyId } from "@/config/ratios.config";
import type { ExtractionValues } from "@/schemas/extraction.schema";
import { recalculateAndSaveScore } from "@/actions/score-history.actions";
import { generateScoreReportPDF } from "@/actions/pdf.actions";
import { showSuccess, showError } from "@/lib/toast";
import { ScoreGlobal } from "./score-global";
import { ScoreFamille } from "./score-famille";
import { ScoreRadar } from "./score-radar";
import { ScoreEvolutionChart } from "./score-evolution-chart";
import { RatioDebug } from "./ratio-debug";
import { SectorComparison } from "./sector-comparison";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Loader2, TrendingUp, TrendingDown, AlertCircle, FileDown } from "lucide-react";

interface ScoreDashboardProps {
  enterpriseId: string;
  score: ScoreResult;
  scoresParAnnee?: YearScore[];
  extractionData?: ExtractionValues; // Pour le debug des calculs
}

const FAMILY_ORDER: FamilyId[] = [
  "liquidite",
  "rentabilite",
  "solvabilite",
  "activite",
  "evolution",
];

export function ScoreDashboard({ enterpriseId, score, scoresParAnnee, extractionData }: ScoreDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const result = await generateScoreReportPDF(enterpriseId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Erreur lors de la génération");
      }

      // Décoder le base64 et créer le blob
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });

      // Créer le lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename || "rapport-score.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess("Téléchargé", "Rapport PDF téléchargé avec succès");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      showError("Erreur", "Erreur lors de l'export du PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRecalculate = () => {
    startTransition(async () => {
      const result = await recalculateAndSaveScore(enterpriseId);

      if (result.success) {
        showSuccess(
          "Score recalculé",
          result.scoreGlobal !== undefined
            ? `Nouveau score : ${result.scoreGlobal.toFixed(1)}/10`
            : undefined
        );
        router.refresh();
      } else {
        showError("Erreur", result.error || "Impossible de recalculer le score");
      }
    });
  };

  const { statistiques } = score;
  const hasMultiYearData = scoresParAnnee && scoresParAnnee.length > 1;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* En-tête avec score global et radar */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 items-center">
        {/* Score global - centré sur mobile */}
        <div className="flex justify-center order-1">
          <ScoreGlobal score={score.scoreGlobal} ratiosExclus={statistiques.ratiosExclus} />
        </div>

        {/* Radar des familles */}
        <div className="order-2 md:order-2 lg:col-span-1">
          <ScoreRadar
            scoreParFamille={score.scoreParFamille}
            scoreGlobal={score.scoreGlobal}
          />
        </div>

        {/* Évolution du score ou statistiques */}
        <div className="order-3 md:col-span-2 lg:col-span-1">
          {hasMultiYearData ? (
            <div className="flex flex-col gap-3 sm:gap-4">
              <ScoreEvolutionChart scoresParAnnee={scoresParAnnee} />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleRecalculate}
                  disabled={isPending}
                  className="flex-1 sm:flex-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recalcul en cours...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recalculer le score
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Export...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" />
                      Exporter PDF
                    </>
                  )}
                </Button>
                {extractionData && <RatioDebug donnees={extractionData} />}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              <Card>
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Répartition des ratios
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{statistiques.ratiosVerts}</span>
                      <span className="text-xs text-muted-foreground">verts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{statistiques.ratiosJaunes}</span>
                      <span className="text-xs text-muted-foreground">jaunes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{statistiques.ratiosRouges}</span>
                      <span className="text-xs text-muted-foreground">rouges</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Complétude des données : {statistiques.tauxCompletude}%
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleRecalculate}
                  disabled={isPending}
                  className="flex-1 sm:flex-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recalcul en cours...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recalculer le score
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Export...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" />
                      Exporter PDF
                    </>
                  )}
                </Button>
                {extractionData && <RatioDebug donnees={extractionData} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grille des familles */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Détail par famille</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {FAMILY_ORDER.map((familyId) => {
            const familyScore = score.scoreParFamille[familyId];
            if (!familyScore) return null;
            return (
              <ScoreFamille
                key={familyId}
                familyScore={familyScore}
                scoresParAnnee={scoresParAnnee}
                excludedRatios={score.excludedRatios}
              />
            );
          })}
        </div>
      </div>

      {/* Comparaison sectorielle */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Comparaison sectorielle</h2>
        <SectorComparison enterpriseId={enterpriseId} />
      </div>

      {/* Avertissement si complétude faible */}
      {statistiques.tauxCompletude < 70 && (
        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm sm:text-base font-medium text-amber-800 dark:text-amber-200">
              Données incomplètes
            </h4>
            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
              Seulement {statistiques.tauxCompletude}% des ratios ont pu être
              calculés. Le score peut être moins fiable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
