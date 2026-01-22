"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { Enterprise, Document } from "@/types";
import type { ExtractionData } from "@/schemas/extraction.schema";
import { extractValues } from "@/schemas/extraction.schema";
import type { EnterpriseScoreResult } from "@/actions/score.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnterpriseDetail } from "./enterprise-detail";
import { DocumentList } from "./document-list";
import { DocumentUpload } from "./document-upload";
import { StatusIndicator } from "./status-indicator";
import { ScoreDashboard, ScoreHistory } from "@/components/score";
import type { ScoreHistoryEntry } from "@/repositories/score-history.repository";
import { Info, FileText, BarChart3, FileWarning } from "lucide-react";

type TabValue = "informations" | "documents" | "score";

// Type pour les données d'extraction (identique à celui de DocumentList)
interface ExtractedData {
  id: string;
  donnees: ExtractionData;
  is_validated: boolean;
}

interface EnterpriseTabsProps {
  enterprise: Enterprise;
  documents: Document[];
  extractions: Map<string, ExtractedData>;
  scoreResult: EnterpriseScoreResult;
  scoreHistory: ScoreHistoryEntry[];
}

export function EnterpriseTabs({
  enterprise,
  documents,
  extractions,
  scoreResult,
  scoreHistory,
}: EnterpriseTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = (searchParams.get("tab") as TabValue) || "informations";

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "informations") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header avec nom de l'entreprise et statut */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{enterprise.raison_sociale || "Sans nom"}</h1>
          <p className="text-sm text-muted-foreground">SIREN: {enterprise.siren}</p>
        </div>
        <StatusIndicator status={enterprise.statut} />
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="informations" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
            <Info className="h-4 w-4 shrink-0" />
            <span className="truncate">Infos</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="score" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="truncate">Score</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="mt-4 sm:mt-6">
          <EnterpriseDetail enterprise={enterprise} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          <DocumentList
            enterpriseId={enterprise.id}
            documents={documents}
            extractions={extractions}
          />
          <DocumentUpload enterpriseId={enterprise.id} />
        </TabsContent>

        <TabsContent value="score" className="mt-4 sm:mt-6">
          <ScoreTabContent
            enterpriseId={enterprise.id}
            scoreResult={scoreResult}
            scoreHistory={scoreHistory}
            extractions={extractions}
            onGoToDocuments={() => handleTabChange("documents")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ScoreTabContentProps {
  enterpriseId: string;
  scoreResult: EnterpriseScoreResult;
  scoreHistory: ScoreHistoryEntry[];
  extractions: Map<string, ExtractedData>;
  onGoToDocuments: () => void;
}

function ScoreTabContent({
  enterpriseId,
  scoreResult,
  scoreHistory,
  extractions,
  onGoToDocuments,
}: ScoreTabContentProps) {
  // Récupère les données d'extraction validées les plus récentes pour le debug
  const latestValidatedExtraction = useMemo(() => {
    const validatedExtractions = Array.from(extractions.values()).filter(
      (ext) => ext.is_validated
    );
    if (validatedExtractions.length === 0) return undefined;
    // Prend la première extraction validée (on pourrait trier par date si disponible)
    const extraction = validatedExtractions[0];
    return extractValues(extraction.donnees);
  }, [extractions]);
  // Erreur
  if (!scoreResult.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{scoreResult.error}</p>
        </CardContent>
      </Card>
    );
  }

  // Pas de données validées
  if (!scoreResult.hasValidatedData || !scoreResult.score) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileWarning className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle>Aucune donnée validée</CardTitle>
          <CardDescription>
            Pour calculer le score de défaillance, vous devez d&apos;abord
            extraire et valider les données financières d&apos;une liasse fiscale.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Étapes à suivre :</p>
            <ol className="text-sm text-left max-w-md mx-auto space-y-2">
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs shrink-0">
                  1
                </span>
                <span>Uploadez une liasse fiscale (CERFA 2050-2059)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs shrink-0">
                  2
                </span>
                <span>Configurez le type de document comme &quot;Liasse fiscale&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs shrink-0">
                  3
                </span>
                <span>Lancez l&apos;extraction des données</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs shrink-0">
                  4
                </span>
                <span>Vérifiez et validez les données extraites</span>
              </li>
            </ol>
            <Button onClick={onGoToDocuments} className="mt-4">
              Gérer les documents
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Score disponible
  return (
    <div className="space-y-8">
      <ScoreDashboard
        enterpriseId={enterpriseId}
        score={scoreResult.score}
        scoresParAnnee={scoreResult.scoresParAnnee}
        extractionData={latestValidatedExtraction}
      />
      <ScoreHistory enterpriseId={enterpriseId} history={scoreHistory} />
    </div>
  );
}
