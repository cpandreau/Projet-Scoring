"use server";

import {
  generateScoreReport,
  type ReportData,
} from "@/lib/pdf/generate-score-report";
import { calculateEnterpriseScore } from "./score.actions";
import { getEnterpriseById } from "@/repositories/enterprise.repository";
import { RATIOS, RATIO_FAMILIES, type FamilyId } from "@/config/ratios.config";

export async function generateScoreReportPDF(enterpriseId: string): Promise<{
  success: boolean;
  data?: string; // Base64 encoded PDF
  filename?: string;
  error?: string;
}> {
  try {
    // Récupérer l'entreprise
    const enterprise = await getEnterpriseById(enterpriseId);
    if (!enterprise) {
      return { success: false, error: "Entreprise non trouvée" };
    }

    // Calculer le score (sans sauvegarder dans l'historique)
    const scoreResult = await calculateEnterpriseScore(enterpriseId, {
      saveToHistory: false,
    });

    if (!scoreResult.success || !scoreResult.score) {
      return {
        success: false,
        error: scoreResult.error || "Erreur de calcul du score",
      };
    }

    const { score, anneesDisponibles } = scoreResult;
    const anneeExercice =
      anneesDisponibles && anneesDisponibles.length > 0
        ? anneesDisponibles[0]
        : new Date().getFullYear();

    // Construire la liste des ratios pour le rapport
    const ratiosForReport: ReportData["ratios"] = [];

    for (const [ratioKey, ratioDetail] of Object.entries(score.detailRatios)) {
      const ratioConfig = RATIOS[ratioKey];
      if (!ratioConfig) continue;

      const familyConfig = RATIO_FAMILIES[ratioConfig.famille as FamilyId];

      ratiosForReport.push({
        famille: familyConfig?.nom || ratioConfig.famille,
        nom: ratioDetail.nom,
        valeur: ratioDetail.valeur,
        unite: ratioConfig.unite,
        zone: ratioDetail.zone,
      });
    }

    // Préparer les données du rapport
    const reportData: ReportData = {
      enterprise: {
        nom: enterprise.raison_sociale || "Sans nom",
        siren: enterprise.siren || undefined,
        formeJuridique: enterprise.forme_juridique || undefined,
      },
      anneeExercice,
      dateCalcul: new Date().toLocaleDateString("fr-FR"),
      score: {
        global: score.scoreGlobal,
        liquidite: score.scoreParFamille.liquidite?.score ?? null,
        rentabilite: score.scoreParFamille.rentabilite?.score ?? null,
        solvabilite: score.scoreParFamille.solvabilite?.score ?? null,
        activite: score.scoreParFamille.activite?.score ?? null,
        evolution: score.scoreParFamille.evolution?.score ?? null,
      },
      ratios: ratiosForReport,
    };

    // Générer le PDF
    const pdfBytes = await generateScoreReport(reportData);

    // Convertir en base64 pour le transfert via server action
    const base64Pdf = Buffer.from(pdfBytes).toString("base64");

    // Nom du fichier
    const safeName = (enterprise.raison_sociale || "entreprise")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .substring(0, 50);
    const filename = `rapport-score-${safeName}-${anneeExercice}.pdf`;

    return {
      success: true,
      data: base64Pdf,
      filename,
    };
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    return {
      success: false,
      error: "Erreur lors de la génération du PDF",
    };
  }
}
