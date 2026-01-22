/**
 * Système de pertinence des ratios
 *
 * Détermine si un ratio est pertinent pour une entreprise donnée
 * en fonction de ses données financières.
 *
 * Les ratios non pertinents sont exclus du calcul de score pour éviter
 * de pénaliser une entreprise sur des métriques qui ne s'appliquent pas
 * à son activité (ex: marge commerciale pour une entreprise de services).
 */

import type { ExtractionValues } from "@/schemas/extraction.schema";
import { calculateBFR } from "./calculate";

// Résultat de la vérification de pertinence
export interface RelevanceCheck {
  relevant: boolean;
  reason?: string;
}

// Ratio exclu avec sa raison
export interface ExcludedRatio {
  key: string;
  reason: string;
}

// Résultat du filtrage
export interface RelevanceFilterResult {
  relevantKeys: string[];
  excluded: ExcludedRatio[];
}

/**
 * Détermine si un ratio est pertinent pour une entreprise donnée
 * basé sur ses données financières.
 *
 * @param ratioKey Identifiant du ratio
 * @param donnees Données financières extraites
 * @param ratioValue Valeur calculée du ratio (optionnel, pour vérifier si calculable)
 * @returns Objet indiquant si le ratio est pertinent et la raison si non
 */
export function isRatioRelevant(
  ratioKey: string,
  donnees: ExtractionValues,
  ratioValue?: number | null
): RelevanceCheck {
  const ca = donnees.chiffre_affaires ?? 0;
  const ventes_march = donnees.ventes_marchandises ?? 0;
  const stocks = donnees.stocks ?? 0;
  const production = donnees.production ?? 0;
  const dettes_fin = donnees.dettes_financieres ?? 0;
  const decouvert = donnees.decouvert_bancaire;

  switch (ratioKey) {
    // -------------------------------------------------------------------------
    // Marge commerciale : pertinent seulement si ventes marchandises > 5% du CA
    // -------------------------------------------------------------------------
    case "taux_marge_commerciale":
    case "variation_marge_commerciale_n1":
    case "variation_marge_commerciale_n2":
      if (ca > 0 && ventes_march / ca < 0.05) {
        return {
          relevant: false,
          reason: "Activité commerciale non significative (< 5% du CA)",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Rotation des stocks : pertinent seulement si stocks > 1% du CA
    // -------------------------------------------------------------------------
    case "rotation_stocks":
    case "variation_rotation_stocks_n1":
    case "variation_rotation_stocks_n2":
      if (ca > 0 && stocks / ca < 0.01) {
        return {
          relevant: false,
          reason: "Stocks non significatifs (< 1% du CA)",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Marge industrielle : pertinent seulement si production > 10% du CA
    // -------------------------------------------------------------------------
    case "taux_marge_industrielle":
      if (ca > 0 && production / ca < 0.1) {
        return {
          relevant: false,
          reason: "Activité industrielle non significative (< 10% du CA)",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Poids du découvert : pertinent seulement si dettes financières > 0
    // Et si découvert disponible (pas en liasse simplifiée)
    // -------------------------------------------------------------------------
    case "poids_decouvert":
      if (dettes_fin <= 0) {
        return {
          relevant: false,
          reason: "Pas de dettes financières",
        };
      }
      // Si découvert est null (liasse simplifiée), non pertinent
      if (decouvert === null) {
        return {
          relevant: false,
          reason: "Découvert non disponible en liasse simplifiée",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Capacité de remboursement : pertinent seulement si dettes financières significatives
    // -------------------------------------------------------------------------
    case "capacite_remboursement":
      if (dettes_fin < 1000) {
        return {
          relevant: false,
          reason: "Dettes financières non significatives (< 1 000 €)",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Taux d'endettement : pertinent seulement si dettes financières > 0
    // -------------------------------------------------------------------------
    case "taux_endettement":
      if (dettes_fin <= 0) {
        return {
          relevant: false,
          reason: "Pas de dettes financières",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Ratios d'évolution N/N-1 : pertinents seulement si données N-1 disponibles
    // Ces ratios sont calculés dans calculateRatios avec donneesN1
    // S'ils sont null, c'est que N-1 n'était pas disponible
    // -------------------------------------------------------------------------
    case "variation_ca_n1":
    case "variation_va_n1":
    case "variation_resultat_n1":
    case "variation_marge_commerciale_n1":
    case "variation_marge_brute_n1":
    case "variation_charges_personnel_va_n1":
    case "variation_charges_financieres_va_n1":
    case "variation_impots_va_n1":
    case "variation_rotation_stocks_n1":
      if (ratioValue === null || ratioValue === undefined) {
        return {
          relevant: false,
          reason: "Données N-1 non disponibles pour calcul d'évolution",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Ratios d'évolution N/N-2 : pertinents seulement si données N-2 disponibles
    // -------------------------------------------------------------------------
    case "variation_ca_n2":
    case "variation_va_n2":
    case "variation_resultat_n2":
    case "variation_marge_commerciale_n2":
    case "variation_marge_brute_n2":
    case "variation_charges_personnel_va_n2":
    case "variation_charges_financieres_va_n2":
    case "variation_impots_va_n2":
    case "variation_rotation_stocks_n2":
      if (ratioValue === null || ratioValue === undefined) {
        return {
          relevant: false,
          reason: "Données N-2 non disponibles pour calcul d'évolution",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Cash flow d'exploitation : pertinent seulement si données N-1 disponibles
    // -------------------------------------------------------------------------
    case "cash_flow_exploitation":
      if (ratioValue === null || ratioValue === undefined) {
        return {
          relevant: false,
          reason: "Données N-1 non disponibles pour calcul du cash flow",
        };
      }
      break;

    // -------------------------------------------------------------------------
    // Rentabilité économique : pertinent seulement si (Actif immo + BFR) > 1000
    // -------------------------------------------------------------------------
    case "rentabilite_economique": {
      const bfr = calculateBFR(donnees);
      const actifImmo = donnees.actif_immobilise ?? 0;
      const denominateur = actifImmo + (bfr ?? 0);

      if (denominateur <= 1000) {
        return {
          relevant: false,
          reason: "Dénominateur (Actif immo + BFR) trop faible ou négatif",
        };
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Équilibre global : pertinent seulement si (Actif immo + BFR) > 1000
    // -------------------------------------------------------------------------
    case "equilibre_global": {
      const bfrEq = calculateBFR(donnees);
      const actifImmoEq = donnees.actif_immobilise ?? 0;
      const denominateurEq = actifImmoEq + (bfrEq ?? 0);

      if (denominateurEq <= 1000) {
        return {
          relevant: false,
          reason: "Dénominateur (Actif immo + BFR) trop faible ou négatif",
        };
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Couverture du BFR : pertinent seulement si BFR > 0
    // -------------------------------------------------------------------------
    case "couverture_bfr": {
      const bfrCouv = calculateBFR(donnees);

      if (bfrCouv === null || bfrCouv <= 0) {
        return {
          relevant: false,
          reason: "BFR négatif ou nul (pas besoin de couverture)",
        };
      }
      break;
    }
  }

  return { relevant: true };
}

/**
 * Filtre les ratios non pertinents d'une liste de clés
 *
 * @param ratioKeys Liste des clés de ratios à vérifier
 * @param donnees Données financières extraites
 * @returns Objet contenant les clés pertinentes et les exclusions
 */
export function filterRelevantRatioKeys(
  ratioKeys: string[],
  donnees: ExtractionValues
): RelevanceFilterResult {
  const relevantKeys: string[] = [];
  const excluded: ExcludedRatio[] = [];

  for (const key of ratioKeys) {
    const check = isRatioRelevant(key, donnees);
    if (check.relevant) {
      relevantKeys.push(key);
    } else {
      excluded.push({ key, reason: check.reason! });
    }
  }

  // Log des ratios exclus en développement
  if (process.env.NODE_ENV === "development" && excluded.length > 0) {
    console.log("[RELEVANCE] Ratios exclus:", excluded);
  }

  return { relevantKeys, excluded };
}

/**
 * Vérifie si un ratio spécifique est pertinent
 * Wrapper simple pour une utilisation inline
 */
export function shouldIncludeRatio(
  ratioKey: string,
  donnees: ExtractionValues
): boolean {
  return isRatioRelevant(ratioKey, donnees).relevant;
}
