/**
 * Calcul du score de santé financière
 * Défaillantomètre - Score global sur 10
 *
 * RÈGLES DE CALCUL :
 * ==================
 * - Le score est calculé sur les données de l'année N uniquement
 * - Les ratios d'évolution comparent N vs N-1 (ou N-2) mais le score résultant est pour N
 * - Si N-1 n'est pas disponible, les ratios d'évolution sont marqués "non calculables"
 *   et exclus du score (comme les ratios non pertinents)
 * - Les ratios non pertinents (activité non significative) sont exclus
 * - Les ratios non calculables (données manquantes) sont exclus
 *
 * PONDÉRATION :
 * =============
 * - Le score final = moyenne pondérée des familles :
 *   - Liquidité    : 30%
 *   - Rentabilité  : 20%
 *   - Solvabilité  : 20%
 *   - Activité     : 15%
 *   - Évolution    : 15%
 *
 * SCORING PAR FAMILLE :
 * =====================
 * - Chaque famille = (points obtenus / points max possibles) × 10
 * - Points max = 2 × nombre de ratios PERTINENTS de la famille
 * - Vert = 2 points, Jaune = 1 point, Rouge = 0 point
 */

import {
  RATIO_FAMILIES,
  RATIOS,
  getRatiosByFamily,
  type FamilyId,
} from "@/config/ratios.config";
import { getZone, type Zone, type QuartilesMap } from "./zone";
import type { CalculatedRatios } from "./calculate";
import type { ExtractionValues } from "@/schemas/extraction.schema";
import { isRatioRelevant, type ExcludedRatio } from "./relevance";

// Points par zone
const POINTS_BY_ZONE: Record<Zone, number> = {
  vert: 2,
  jaune: 1,
  rouge: 0,
};

// Détail d'un ratio dans le scoring
export interface RatioDetail {
  id: string;
  nom: string;
  valeur: number | null;
  zone: Zone;
  points: number;
  pointsMax: number;
}

// Score d'une famille
export interface FamilyScore {
  id: FamilyId;
  nom: string;
  poids: number;
  score: number; // Score sur 10
  pointsObtenus: number;
  pointsMax: number;
  ratios: RatioDetail[];
}

// Résultat complet du scoring
export interface ScoreResult {
  scoreGlobal: number; // Score final sur 10
  scoreParFamille: Record<FamilyId, FamilyScore>;
  detailRatios: Record<string, RatioDetail>;
  excludedRatios: ExcludedRatio[]; // Ratios exclus car non pertinents
  statistiques: {
    ratiosVerts: number;
    ratiosJaunes: number;
    ratiosRouges: number;
    totalRatios: number;
    ratiosExclus: number; // Nombre de ratios exclus car non pertinents
    tauxCompletude: number; // % de ratios calculables (non null avant scoring)
  };
}

/**
 * Calcule les points d'un ratio
 */
function calculateRatioPoints(
  ratioKey: string,
  value: number | null,
  quartiles?: QuartilesMap
): { zone: Zone; points: number } {
  const zone = getZone(ratioKey, value, quartiles);
  const points = POINTS_BY_ZONE[zone];
  return { zone, points };
}

/**
 * Calcule le score d'une famille de ratios
 * Les ratios non pertinents sont exclus du calcul
 */
function calculateFamilyScore(
  familyId: FamilyId,
  ratios: CalculatedRatios,
  donnees: ExtractionValues | undefined,
  quartiles?: QuartilesMap
): { familyScore: FamilyScore; excluded: ExcludedRatio[] } {
  const family = RATIO_FAMILIES[familyId];
  const familyRatios = getRatiosByFamily(familyId);

  const ratioDetails: RatioDetail[] = [];
  const excluded: ExcludedRatio[] = [];
  let totalPoints = 0;
  let relevantCount = 0;
  const maxPointsPerRatio = 2; // Vert = 2 points

  for (const ratioDef of familyRatios) {
    const value = ratios[ratioDef.id as keyof CalculatedRatios] ?? null;

    // Vérifier la pertinence du ratio (activité, disponibilité données N-1, etc.)
    if (donnees) {
      const relevanceCheck = isRatioRelevant(ratioDef.id, donnees, value);
      if (!relevanceCheck.relevant) {
        excluded.push({ key: ratioDef.id, reason: relevanceCheck.reason! });
        // Ne pas inclure dans les détails ni dans le calcul
        continue;
      }
    }

    const { zone, points } = calculateRatioPoints(ratioDef.id, value, quartiles);

    ratioDetails.push({
      id: ratioDef.id,
      nom: ratioDef.nom,
      valeur: value,
      zone,
      points,
      pointsMax: maxPointsPerRatio,
    });

    totalPoints += points;
    relevantCount++;
  }

  const maxPoints = relevantCount * maxPointsPerRatio;
  // Score sur 10 pour la famille (basé uniquement sur les ratios pertinents)
  const score = maxPoints > 0 ? (totalPoints / maxPoints) * 10 : 0;

  return {
    familyScore: {
      id: familyId,
      nom: family.nom,
      poids: family.poids,
      score: Math.round(score * 100) / 100, // Arrondi à 2 décimales
      pointsObtenus: totalPoints,
      pointsMax: maxPoints,
      ratios: ratioDetails,
    },
    excluded,
  };
}

/**
 * Calcule le score global à partir des ratios calculés
 *
 * @param ratios Ratios financiers calculés
 * @param donnees Données d'extraction (optionnel, pour filtrer les ratios non pertinents)
 * @param quartiles Données des quartiles BdF (optionnel)
 * @returns Résultat complet du scoring
 */
export function calculateScore(
  ratios: CalculatedRatios,
  donnees?: ExtractionValues,
  quartiles?: QuartilesMap
): ScoreResult {
  const familyIds: FamilyId[] = [
    "liquidite",
    "rentabilite",
    "solvabilite",
    "activite",
    "evolution",
  ];

  // Calculer le score de chaque famille
  const scoreParFamille: Record<FamilyId, FamilyScore> = {} as Record<
    FamilyId,
    FamilyScore
  >;

  let scoreGlobal = 0;
  const detailRatios: Record<string, RatioDetail> = {};
  const allExcludedRatios: ExcludedRatio[] = [];

  // Statistiques
  let ratiosVerts = 0;
  let ratiosJaunes = 0;
  let ratiosRouges = 0;
  let ratiosCalculables = 0;
  let totalRatios = 0;

  for (const familyId of familyIds) {
    const { familyScore, excluded } = calculateFamilyScore(
      familyId,
      ratios,
      donnees,
      quartiles
    );
    scoreParFamille[familyId] = familyScore;
    allExcludedRatios.push(...excluded);

    // Ajouter à la score global pondéré
    scoreGlobal += familyScore.score * (familyScore.poids / 100);

    // Collecter les détails des ratios et statistiques
    for (const ratio of familyScore.ratios) {
      detailRatios[ratio.id] = ratio;
      totalRatios++;

      switch (ratio.zone) {
        case "vert":
          ratiosVerts++;
          break;
        case "jaune":
          ratiosJaunes++;
          break;
        case "rouge":
          ratiosRouges++;
          break;
      }

      // Compter les ratios calculables (valeur non null dans les données sources)
      if (ratio.valeur !== null) {
        ratiosCalculables++;
      }
    }
  }

  // Log des ratios exclus en développement
  if (process.env.NODE_ENV === "development" && allExcludedRatios.length > 0) {
    console.log("[SCORE] Ratios exclus car non pertinents:", allExcludedRatios);
  }

  // Arrondir le score global
  scoreGlobal = Math.round(scoreGlobal * 100) / 100;

  // Validation : le score doit être entre 0 et 10
  if (scoreGlobal < 0 || scoreGlobal > 10) {
    console.error("[SCORE] Score hors limites:", scoreGlobal, {
      scoreParFamille: Object.fromEntries(
        Object.entries(scoreParFamille).map(([k, v]) => [k, v.score])
      ),
    });
    // Forcer dans les limites pour éviter les erreurs d'affichage
    scoreGlobal = Math.max(0, Math.min(10, scoreGlobal));
  }

  return {
    scoreGlobal,
    scoreParFamille,
    detailRatios,
    excludedRatios: allExcludedRatios,
    statistiques: {
      ratiosVerts,
      ratiosJaunes,
      ratiosRouges,
      totalRatios,
      ratiosExclus: allExcludedRatios.length,
      tauxCompletude: totalRatios > 0
        ? Math.round((ratiosCalculables / totalRatios) * 100)
        : 0,
    },
  };
}

/**
 * Interprète le score global
 */
export function interpretScore(score: number): {
  niveau: "critique" | "alerte" | "vigilance" | "satisfaisant" | "excellent";
  label: string;
  description: string;
  couleur: string;
} {
  if (score < 3) {
    return {
      niveau: "critique",
      label: "Risque critique",
      description: "Situation financière très préoccupante nécessitant une action immédiate",
      couleur: "#dc2626", // red-600
    };
  }
  if (score < 5) {
    return {
      niveau: "alerte",
      label: "Risque élevé",
      description: "Signaux d'alerte importants, vigilance renforcée recommandée",
      couleur: "#ea580c", // orange-600
    };
  }
  if (score < 7) {
    return {
      niveau: "vigilance",
      label: "Vigilance",
      description: "Situation à surveiller, quelques points d'amélioration",
      couleur: "#ca8a04", // yellow-600
    };
  }
  if (score < 8.5) {
    return {
      niveau: "satisfaisant",
      label: "Satisfaisant",
      description: "Bonne santé financière avec une structure équilibrée",
      couleur: "#16a34a", // green-600
    };
  }
  return {
    niveau: "excellent",
    label: "Excellent",
    description: "Excellente santé financière, entreprise solide",
    couleur: "#059669", // emerald-600
  };
}

/**
 * Génère un résumé textuel du scoring
 */
export function generateScoreSummary(result: ScoreResult): string {
  const interpretation = interpretScore(result.scoreGlobal);
  const { statistiques } = result;

  const lines = [
    `Score global : ${result.scoreGlobal.toFixed(1)}/10 - ${interpretation.label}`,
    "",
    "Détail par famille :",
  ];

  for (const family of Object.values(result.scoreParFamille)) {
    lines.push(
      `  • ${family.nom} (${family.poids}%) : ${family.score.toFixed(1)}/10`
    );
  }

  lines.push("");
  lines.push(
    `Ratios : ${statistiques.ratiosVerts} verts, ${statistiques.ratiosJaunes} jaunes, ${statistiques.ratiosRouges} rouges`
  );
  lines.push(`Complétude des données : ${statistiques.tauxCompletude}%`);

  return lines.join("\n");
}

/**
 * Identifie les points faibles (ratios rouges) par ordre de priorité
 */
export function getWeakPoints(result: ScoreResult): RatioDetail[] {
  return Object.values(result.detailRatios)
    .filter((ratio) => ratio.zone === "rouge")
    .sort((a, b) => {
      // Trier par famille (poids décroissant) puis par nom
      const familyA = RATIOS[a.id]?.famille;
      const familyB = RATIOS[b.id]?.famille;
      const poidsA = familyA ? RATIO_FAMILIES[familyA].poids : 0;
      const poidsB = familyB ? RATIO_FAMILIES[familyB].poids : 0;
      return poidsB - poidsA;
    });
}

/**
 * Identifie les points forts (ratios verts)
 */
export function getStrongPoints(result: ScoreResult): RatioDetail[] {
  return Object.values(result.detailRatios)
    .filter((ratio) => ratio.zone === "vert")
    .sort((a, b) => a.nom.localeCompare(b.nom));
}
