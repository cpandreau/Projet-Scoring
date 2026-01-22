"use server";

import {
  comparerAuSecteur,
  type SectorComparisonResult,
} from "@/lib/api/sector-comparison";
import { calculateEnterpriseScore } from "./score.actions";
import { getEnterpriseById } from "@/repositories/enterprise.repository";

export async function getSectorComparison(
  enterpriseId: string
): Promise<SectorComparisonResult | null> {
  try {
    // Recuperer l'entreprise
    const enterprise = await getEnterpriseById(enterpriseId);
    if (!enterprise) {
      console.error("[SectorComparison] Enterprise not found");
      return null;
    }

    // Verifier que le code NAF est renseigne
    if (!enterprise.code_naf) {
      return {
        classeNaf: "",
        classeCA: "",
        exercice: "",
        cohorte: 0,
        comparisons: [],
        loading: false,
        error: "Code NAF non renseigne pour cette entreprise",
      };
    }

    // Calculer les ratios de l'entreprise
    const scoreResult = await calculateEnterpriseScore(enterpriseId, {
      saveToHistory: false,
    });
    if (!scoreResult.success || !scoreResult.score) {
      return {
        classeNaf: enterprise.code_naf,
        classeCA: "",
        exercice: "",
        cohorte: 0,
        comparisons: [],
        loading: false,
        error: "Impossible de calculer les ratios de l'entreprise",
      };
    }

    // Extraire les valeurs des ratios depuis detailRatios
    const ratiosEntreprise: Record<string, number | null> = {};
    for (const [ratioId, detail] of Object.entries(scoreResult.score.detailRatios)) {
      ratiosEntreprise[ratioId] = detail.valeur;
    }

    // Recuperer le CA pour determiner la tranche
    let chiffreAffaires = 0;
    if (scoreResult.extractionData) {
      const caField = scoreResult.extractionData.chiffre_affaires;
      if (caField && typeof caField === "object" && "valeur" in caField) {
        chiffreAffaires = caField.valeur ?? 0;
      } else if (typeof caField === "number") {
        chiffreAffaires = caField;
      }
    }

    // Comparer au secteur
    const comparison = await comparerAuSecteur(
      ratiosEntreprise,
      enterprise.code_naf,
      chiffreAffaires
    );

    return comparison;
  } catch (error) {
    console.error("[SectorComparison] Error:", error);
    return null;
  }
}
