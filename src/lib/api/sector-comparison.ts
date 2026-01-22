/**
 * Service de comparaison sectorielle
 * Compare les ratios d'une entreprise aux benchmarks du secteur
 */

import {
  fetchSectorBenchmarks,
  getTrancheCA,
  TRANCHES_CA,
} from "./sector-benchmarks";
import { RATIO_MAPPINGS, extractQuartiles } from "./sector-benchmarks-mapping";

export type PositionSectorielle =
  | "top10" // Top 10% (> Q90)
  | "top25" // Top 25% (> Q75)
  | "median_sup" // Au-dessus de la mediane (> Q50)
  | "median_inf" // En-dessous de la mediane (< Q50)
  | "bottom25" // Bottom 25% (< Q25)
  | "bottom10" // Bottom 10% (< Q10)
  | "non_disponible";

export interface RatioComparison {
  ratioId: string;
  nom: string;
  valeurEntreprise: number;
  unite: string;
  q10: number | null;
  q25: number | null;
  q50: number | null;
  q75: number | null;
  q90: number | null;
  position: PositionSectorielle;
  percentileEstime: number; // 0-100
  ecartMediane: number | null; // En %
  sensInverse: boolean;
}

export interface SectorComparisonResult {
  classeNaf: string; // Code NAF (ex: "6920")
  classeCA: string; // Tranche CA (ex: "<2M")
  exercice: string; // Annee (ex: "2022")
  cohorte: number; // Nombre d'entreprises dans la cohorte
  comparisons: RatioComparison[];
  loading: boolean;
  error: string | null;
}

/**
 * Determine la position sectorielle
 */
function getPosition(
  valeur: number,
  q10: number | null,
  q25: number | null,
  q50: number | null,
  q75: number | null,
  q90: number | null,
  sensInverse: boolean
): PositionSectorielle {
  if (
    q10 === null ||
    q25 === null ||
    q50 === null ||
    q75 === null ||
    q90 === null
  ) {
    return "non_disponible";
  }

  // Pour les ratios ou "moins c'est mieux", on inverse la logique
  if (sensInverse) {
    if (valeur <= q10) return "top10";
    if (valeur <= q25) return "top25";
    if (valeur <= q50) return "median_sup";
    if (valeur <= q75) return "median_inf";
    if (valeur <= q90) return "bottom25";
    return "bottom10";
  }

  // Pour les ratios ou "plus c'est mieux"
  if (valeur >= q90) return "top10";
  if (valeur >= q75) return "top25";
  if (valeur >= q50) return "median_sup";
  if (valeur >= q25) return "median_inf";
  if (valeur >= q10) return "bottom25";
  return "bottom10";
}

/**
 * Estime le percentile (0-100)
 */
function estimerPercentile(
  valeur: number,
  q10: number | null,
  q25: number | null,
  q50: number | null,
  q75: number | null,
  q90: number | null,
  sensInverse: boolean
): number {
  if (
    q10 === null ||
    q25 === null ||
    q50 === null ||
    q75 === null ||
    q90 === null
  ) {
    return 50;
  }

  let percentile: number;

  if (valeur <= q10) {
    percentile = 5;
  } else if (valeur <= q25) {
    percentile = 10 + 15 * ((valeur - q10) / (q25 - q10 || 1));
  } else if (valeur <= q50) {
    percentile = 25 + 25 * ((valeur - q25) / (q50 - q25 || 1));
  } else if (valeur <= q75) {
    percentile = 50 + 25 * ((valeur - q50) / (q75 - q50 || 1));
  } else if (valeur <= q90) {
    percentile = 75 + 15 * ((valeur - q75) / (q90 - q75 || 1));
  } else {
    percentile = 95;
  }

  // Inverser pour les ratios ou moins c'est mieux
  if (sensInverse) {
    percentile = 100 - percentile;
  }

  return Math.round(Math.max(0, Math.min(100, percentile)));
}

/**
 * Compare les ratios d'une entreprise aux benchmarks sectoriels
 */
export async function comparerAuSecteur(
  ratiosEntreprise: Record<string, number | null>,
  codeNaf: string,
  chiffreAffaires: number
): Promise<SectorComparisonResult> {
  // Recuperer les benchmarks depuis l'API
  const benchmark = await fetchSectorBenchmarks(codeNaf, chiffreAffaires);

  if (!benchmark) {
    const trancheCA = getTrancheCA(chiffreAffaires);
    return {
      classeNaf: codeNaf,
      classeCA: TRANCHES_CA[trancheCA],
      exercice: "",
      cohorte: 0,
      comparisons: [],
      loading: false,
      error: "Aucune donnee sectorielle disponible pour ce secteur",
    };
  }

  // Comparer chaque ratio
  const comparisons: RatioComparison[] = [];

  for (const mapping of RATIO_MAPPINGS) {
    const valeurEntreprise = ratiosEntreprise[mapping.ourRatioId];
    if (valeurEntreprise === null || valeurEntreprise === undefined) continue;

    // Extraire les quartiles pour ce ratio
    const quartiles = extractQuartiles(
      benchmark as unknown as Record<string, unknown>,
      mapping.apiPrefix
    );

    // Verifier qu'on a au moins la mediane
    if (quartiles.q50 === null) continue;

    const position = getPosition(
      valeurEntreprise,
      quartiles.q10,
      quartiles.q25,
      quartiles.q50,
      quartiles.q75,
      quartiles.q90,
      mapping.sensInverse
    );

    const percentileEstime = estimerPercentile(
      valeurEntreprise,
      quartiles.q10,
      quartiles.q25,
      quartiles.q50,
      quartiles.q75,
      quartiles.q90,
      mapping.sensInverse
    );

    const ecartMediane =
      quartiles.q50 !== null && quartiles.q50 !== 0
        ? ((valeurEntreprise - quartiles.q50) / Math.abs(quartiles.q50)) * 100
        : null;

    comparisons.push({
      ratioId: mapping.ourRatioId,
      nom: mapping.ourName,
      valeurEntreprise,
      unite: mapping.unite,
      q10: quartiles.q10,
      q25: quartiles.q25,
      q50: quartiles.q50,
      q75: quartiles.q75,
      q90: quartiles.q90,
      position,
      percentileEstime,
      ecartMediane,
      sensInverse: mapping.sensInverse,
    });
  }

  return {
    classeNaf: benchmark.classe_naf,
    classeCA: benchmark.classe_ca,
    exercice: benchmark.exercice,
    cohorte: benchmark.cohorte,
    comparisons,
    loading: false,
    error: null,
  };
}
