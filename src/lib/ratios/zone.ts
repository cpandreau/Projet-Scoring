/**
 * Fonctions de zonage des ratios financiers
 * Détermine si un ratio est dans la zone verte, jaune ou rouge
 */

import {
  RATIOS,
  evaluateFixedThreshold,
  evaluateQuartileThreshold,
  type RatioDefinition,
  type FixedThreshold,
} from "@/config/ratios.config";

// Type pour les zones
export type Zone = "vert" | "jaune" | "rouge";

// Interface pour les quartiles Banque de France
export interface QuartileData {
  q1: number;
  q3: number;
}

// Type pour les quartiles par ratio (sera fourni par les données BdF)
export type QuartilesMap = Partial<Record<string, QuartileData>>;

/**
 * Convertit l'évaluation en français
 */
function toFrenchZone(evaluation: "green" | "yellow" | "red"): Zone {
  switch (evaluation) {
    case "green":
      return "vert";
    case "yellow":
      return "jaune";
    case "red":
      return "rouge";
  }
}

/**
 * Détermine la zone d'un ratio à partir de sa valeur
 *
 * @param ratioKey Clé du ratio (ex: "liquidite_generale")
 * @param value Valeur du ratio (ou null si non calculable)
 * @param quartiles Données des quartiles BdF (optionnel, pour les ratios avec seuils quartile)
 * @returns Zone du ratio ('vert' | 'jaune' | 'rouge')
 */
export function getZone(
  ratioKey: string,
  value: number | null,
  quartiles?: QuartilesMap
): Zone {
  // Si la valeur est null, c'est automatiquement rouge
  if (value === null) {
    return "rouge";
  }

  // Récupérer la définition du ratio
  const ratioDefinition = RATIOS[ratioKey];

  // Si le ratio n'est pas défini, retourner rouge par défaut
  if (!ratioDefinition) {
    console.warn(`Ratio inconnu: ${ratioKey}`);
    return "rouge";
  }

  const { seuils, inverse } = ratioDefinition;

  // Évaluation selon le type de seuil
  if (seuils.type === "fixed") {
    const evaluation = evaluateFixedThreshold(
      value,
      seuils as FixedThreshold,
      inverse
    );
    return toFrenchZone(evaluation);
  }

  // Seuils basés sur les quartiles Banque de France
  if (seuils.type === "quartile") {
    const quartileData = quartiles?.[ratioKey];

    // Si pas de données de quartiles, on utilise des seuils par défaut
    if (!quartileData) {
      // Seuils par défaut pour les ratios quartile (approximations)
      const defaultQuartiles = getDefaultQuartiles(ratioKey);
      if (defaultQuartiles) {
        const evaluation = evaluateQuartileThreshold(
          value,
          defaultQuartiles.q1,
          defaultQuartiles.q3,
          inverse
        );
        return toFrenchZone(evaluation);
      }
      // Si pas de quartiles par défaut, on ne peut pas évaluer
      return "jaune";
    }

    const evaluation = evaluateQuartileThreshold(
      value,
      quartileData.q1,
      quartileData.q3,
      inverse
    );
    return toFrenchZone(evaluation);
  }

  return "jaune";
}

/**
 * Retourne les quartiles par défaut pour les ratios basés sur BdF
 * Ces valeurs sont des approximations moyennes tous secteurs confondus
 */
function getDefaultQuartiles(ratioKey: string): QuartileData | null {
  // Valeurs approximatives basées sur les statistiques Banque de France
  const defaults: Record<string, QuartileData> = {
    // Rentabilité
    taux_rentabilite_financiere: { q1: 2, q3: 15 }, // en %
    taux_va: { q1: 20, q3: 45 }, // en %
    taux_ebe: { q1: 3, q3: 12 }, // en %
    taux_marge_brute: { q1: 15, q3: 40 }, // en %

    // Solvabilité
    taux_endettement: { q1: 30, q3: 150 }, // en % (inversé)

    // Activité
    delai_fournisseurs: { q1: 30, q3: 60 }, // en jours (inversé)
    delai_clients: { q1: 30, q3: 60 }, // en jours (inversé)

    // Évolution
    variation_ca_n1: { q1: -5, q3: 10 }, // en %
    variation_va_n1: { q1: -5, q3: 10 }, // en %
  };

  return defaults[ratioKey] ?? null;
}

/**
 * Détermine les zones de tous les ratios
 *
 * @param ratios Objet contenant les valeurs des ratios
 * @param quartiles Données des quartiles BdF (optionnel)
 * @returns Objet avec les zones de chaque ratio
 */
export function getZones(
  ratios: Record<string, number | null>,
  quartiles?: QuartilesMap
): Record<string, Zone> {
  const zones: Record<string, Zone> = {};

  for (const [key, value] of Object.entries(ratios)) {
    zones[key] = getZone(key, value, quartiles);
  }

  return zones;
}

/**
 * Récupère les informations complètes d'un ratio avec sa zone
 */
export function getRatioWithZone(
  ratioKey: string,
  value: number | null,
  quartiles?: QuartilesMap
): {
  definition: RatioDefinition | null;
  value: number | null;
  zone: Zone;
} {
  const definition = RATIOS[ratioKey] ?? null;
  const zone = getZone(ratioKey, value, quartiles);

  return {
    definition,
    value,
    zone,
  };
}

/**
 * Compte les ratios par zone
 */
export function countByZone(zones: Record<string, Zone>): {
  vert: number;
  jaune: number;
  rouge: number;
  total: number;
} {
  const counts = { vert: 0, jaune: 0, rouge: 0, total: 0 };

  for (const zone of Object.values(zones)) {
    counts[zone]++;
    counts.total++;
  }

  return counts;
}
