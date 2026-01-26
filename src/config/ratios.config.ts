/**
 * Configuration des ratios financiers pour le scoring
 * Défaillantomètre - Évaluation du risque de défaillance
 */

// Types de seuils
export type ThresholdType = 'fixed' | 'quartile'

// Seuils fixes (valeurs en pourcentage ou jours)
export interface FixedThreshold {
  type: 'fixed'
  green: number // Seuil pour vert (bon)
  red: number // Seuil pour rouge (mauvais)
}

// Seuils basés sur les quartiles Banque de France
export interface QuartileThreshold {
  type: 'quartile'
  // Les valeurs Q1/Q3 seront récupérées dynamiquement selon le secteur
}

export type Threshold = FixedThreshold | QuartileThreshold

// Définition d'un ratio
export interface RatioDefinition {
  id: string
  nom: string
  formule: string // Description de la formule
  famille: FamilyId
  seuils: Threshold
  inverse: boolean // true = plus c'est bas, mieux c'est
  unite: '%' | 'jours' | 'ratio'
}

// Identifiants des familles
export type FamilyId = 'liquidite' | 'rentabilite' | 'solvabilite' | 'activite' | 'evolution'

// Définition d'une famille de ratios
export interface FamilyDefinition {
  id: FamilyId
  nom: string
  description: string
  poids: number // Pondération en pourcentage (total = 100%)
}

// ============================================================================
// CONFIGURATION DES FAMILLES
// ============================================================================

export const RATIO_FAMILIES: Record<FamilyId, FamilyDefinition> = {
  liquidite: {
    id: 'liquidite',
    nom: 'Liquidité',
    description: 'Capacité à faire face aux engagements à court terme',
    poids: 30,
  },
  rentabilite: {
    id: 'rentabilite',
    nom: 'Rentabilité',
    description: "Performance économique et financière de l'entreprise",
    poids: 20,
  },
  solvabilite: {
    id: 'solvabilite',
    nom: 'Solvabilité',
    description: 'Capacité à rembourser les dettes à moyen et long terme',
    poids: 20,
  },
  activite: {
    id: 'activite',
    nom: 'Activité',
    description: "Efficacité du cycle d'exploitation",
    poids: 15,
  },
  evolution: {
    id: 'evolution',
    nom: 'Évolution',
    description: "Dynamique de croissance de l'entreprise",
    poids: 15,
  },
}

// ============================================================================
// CONFIGURATION DES RATIOS
// ============================================================================

export const RATIOS: Record<string, RatioDefinition> = {
  // ---------------------------------------------------------------------------
  // LIQUIDITÉ (30%)
  // ---------------------------------------------------------------------------
  liquidite_generale: {
    id: 'liquidite_generale',
    nom: 'Liquidité générale',
    formule: '(Actif circulant / Passif circulant) × 100',
    famille: 'liquidite',
    seuils: { type: 'fixed', green: 150, red: 100 },
    inverse: false,
    unite: '%',
  },
  liquidite_immediate: {
    id: 'liquidite_immediate',
    nom: 'Liquidité immédiate',
    formule: '(Disponibilités / Passif circulant) × 100',
    famille: 'liquidite',
    seuils: { type: 'fixed', green: 75, red: 50 },
    inverse: false,
    unite: '%',
  },
  couverture_bfr: {
    id: 'couverture_bfr',
    nom: 'Couverture du BFR',
    formule: '(BFR / Fonds de roulement) × 100',
    famille: 'liquidite',
    seuils: { type: 'fixed', green: 75, red: 100 },
    inverse: true, // Plus c'est bas, mieux c'est
    unite: '%',
  },

  // ---------------------------------------------------------------------------
  // RENTABILITÉ (20%)
  // ---------------------------------------------------------------------------
  taux_rentabilite_financiere: {
    id: 'taux_rentabilite_financiere',
    nom: 'Taux de rentabilité financière',
    formule: '(CAF / Capitaux propres) × 100',
    famille: 'rentabilite',
    seuils: { type: 'quartile' },
    inverse: false,
    unite: '%',
  },
  rentabilite_economique: {
    id: 'rentabilite_economique',
    nom: 'Rentabilité économique',
    formule: '(EBE / (Actif immobilisé + BFR)) × 100',
    famille: 'rentabilite',
    seuils: { type: 'fixed', green: 10, red: 5 },
    inverse: false,
    unite: '%',
  },
  taux_va: {
    id: 'taux_va',
    nom: 'Taux de valeur ajoutée',
    formule: "(Valeur ajoutée / Chiffre d'affaires) × 100",
    famille: 'rentabilite',
    seuils: { type: 'quartile' },
    inverse: false,
    unite: '%',
  },
  taux_ebe: {
    id: 'taux_ebe',
    nom: "Taux d'EBE",
    formule: "(EBE / Chiffre d'affaires) × 100",
    famille: 'rentabilite',
    seuils: { type: 'quartile' },
    inverse: false,
    unite: '%',
  },
  taux_marge_brute: {
    id: 'taux_marge_brute',
    nom: 'Taux de marge brute',
    formule: '(EBE / Valeur ajoutée) × 100',
    famille: 'rentabilite',
    seuils: { type: 'fixed', green: 15, red: 5 },
    inverse: false,
    unite: '%',
  },
  taux_marge_industrielle: {
    id: 'taux_marge_industrielle',
    nom: 'Taux de marge industrielle',
    formule: '(Production - Achats MP - Charges ext) / Production × 100',
    famille: 'rentabilite',
    seuils: { type: 'fixed', green: 20, red: 10 },
    inverse: false,
    unite: '%',
  },
  taux_marge_commerciale: {
    id: 'taux_marge_commerciale',
    nom: 'Taux de marge commerciale',
    formule: '(Ventes - Achats - Variation stocks) / Ventes × 100',
    famille: 'rentabilite',
    seuils: { type: 'fixed', green: 20, red: 10 },
    inverse: false,
    unite: '%',
  },
  rentabilite_commerciale: {
    id: 'rentabilite_commerciale',
    nom: 'Rentabilité commerciale',
    formule: "(Résultat net / Chiffre d'affaires) × 100",
    famille: 'rentabilite',
    seuils: { type: 'fixed', green: 5, red: 2 },
    inverse: false,
    unite: '%',
  },
  charges_personnel_va: {
    id: 'charges_personnel_va',
    nom: 'Charges de personnel / VA',
    formule: '(Charges de personnel / Valeur ajoutée) × 100',
    famille: 'rentabilite',
    seuils: { type: 'fixed', green: 65, red: 80 },
    inverse: true, // Plus c'est bas, mieux c'est
    unite: '%',
  },
  charges_financieres_va: {
    id: 'charges_financieres_va',
    nom: 'Charges financières / VA',
    formule: '(Charges financières / Valeur ajoutée) × 100',
    famille: 'rentabilite',
    seuils: { type: 'fixed', green: 10, red: 20 },
    inverse: true, // Plus c'est bas, mieux c'est
    unite: '%',
  },
  impots_taxes_va: {
    id: 'impots_taxes_va',
    nom: 'Impôts et taxes / VA',
    formule: '(Impôts et taxes / Valeur ajoutée) × 100',
    famille: 'rentabilite',
    seuils: { type: 'fixed', green: 8, red: 12 },
    inverse: true, // Plus c'est bas, mieux c'est
    unite: '%',
  },

  // ---------------------------------------------------------------------------
  // SOLVABILITÉ (20%)
  // ---------------------------------------------------------------------------
  capacite_remboursement: {
    id: 'capacite_remboursement',
    nom: 'Capacité de remboursement',
    formule: '(Dettes financières / CAF) × 360',
    famille: 'solvabilite',
    seuils: { type: 'fixed', green: 1080, red: 1460 }, // En jours (3 ans / 4 ans)
    inverse: true, // Plus c'est bas, mieux c'est
    unite: 'jours',
  },
  taux_endettement: {
    id: 'taux_endettement',
    nom: "Taux d'endettement",
    formule: '(Dettes financières / Capitaux propres) × 100',
    famille: 'solvabilite',
    seuils: { type: 'quartile' },
    inverse: true, // Plus c'est bas, mieux c'est
    unite: '%',
  },
  autonomie_financiere: {
    id: 'autonomie_financiere',
    nom: 'Autonomie financière',
    formule: '(Capitaux propres / Total passif) × 100',
    famille: 'solvabilite',
    seuils: { type: 'fixed', green: 66, red: 33 },
    inverse: false,
    unite: '%',
  },
  equilibre_global: {
    id: 'equilibre_global',
    nom: 'Équilibre financier global',
    formule: '(Capitaux permanents / (Actif immobilisé + BFR)) × 100',
    famille: 'solvabilite',
    seuils: { type: 'fixed', green: 150, red: 100 },
    inverse: false,
    unite: '%',
  },
  poids_decouvert: {
    id: 'poids_decouvert',
    nom: 'Poids du découvert',
    formule: '(Découvert bancaire / Dettes financières) × 100',
    famille: 'solvabilite',
    seuils: { type: 'fixed', green: 20, red: 40 },
    inverse: true, // Plus c'est bas, mieux c'est
    unite: '%',
  },

  // ---------------------------------------------------------------------------
  // ACTIVITÉ (15%)
  // ---------------------------------------------------------------------------
  ratio_fonds_roulement: {
    id: 'ratio_fonds_roulement',
    nom: 'Ratio de fonds de roulement',
    formule: 'Capitaux permanents / Actif immobilisé',
    famille: 'activite',
    seuils: { type: 'fixed', green: 1.2, red: 1 },
    inverse: false,
    unite: 'ratio',
  },
  delai_fournisseurs: {
    id: 'delai_fournisseurs',
    nom: 'Délai fournisseurs',
    formule: '(Dettes fournisseurs / Achats TTC) × 360',
    famille: 'activite',
    seuils: { type: 'quartile' },
    inverse: true, // Dépend du contexte, mais généralement on veut payer à temps
    unite: 'jours',
  },
  delai_clients: {
    id: 'delai_clients',
    nom: 'Délai clients',
    formule: '(Créances clients / CA TTC) × 360',
    famille: 'activite',
    seuils: { type: 'quartile' },
    inverse: true, // Plus c'est bas, mieux c'est (encaisser vite)
    unite: 'jours',
  },
  rotation_stocks: {
    id: 'rotation_stocks',
    nom: 'Rotation des stocks',
    formule: '(Stocks × 360) / (Achats march. + Achats MP)',
    famille: 'activite',
    seuils: { type: 'fixed', green: 30, red: 60 },
    inverse: true, // Plus c'est bas, mieux c'est (stocks tournent vite)
    unite: 'jours',
  },
  cash_flow_exploitation: {
    id: 'cash_flow_exploitation',
    nom: "Cash-flow d'exploitation",
    formule: 'EBE / (BFR N - BFR N-1)',
    famille: 'activite',
    seuils: { type: 'fixed', green: 1.5, red: 1 },
    inverse: false,
    unite: 'ratio',
  },

  // ---------------------------------------------------------------------------
  // ÉVOLUTION (15%)
  // ---------------------------------------------------------------------------
  variation_ca_n1: {
    id: 'variation_ca_n1',
    nom: 'Variation du CA N/N-1',
    formule: '((CA N - CA N-1) / |CA N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 5, red: 0 },
    inverse: false,
    unite: '%',
  },
  variation_ca_n2: {
    id: 'variation_ca_n2',
    nom: 'Variation du CA N/N-2',
    formule: '((CA N - CA N-2) / |CA N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 5, red: 0 },
    inverse: false,
    unite: '%',
  },
  variation_va_n1: {
    id: 'variation_va_n1',
    nom: 'Variation de la VA N/N-1',
    formule: '((VA N - VA N-1) / |VA N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 5, red: 0 },
    inverse: false,
    unite: '%',
  },
  variation_va_n2: {
    id: 'variation_va_n2',
    nom: 'Variation de la VA N/N-2',
    formule: '((VA N - VA N-2) / |VA N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 5, red: 0 },
    inverse: false,
    unite: '%',
  },
  variation_resultat_n1: {
    id: 'variation_resultat_n1',
    nom: 'Variation du résultat N/N-1',
    formule: '((RN N - RN N-1) / |RN N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 5, red: 0 },
    inverse: false,
    unite: '%',
  },
  variation_resultat_n2: {
    id: 'variation_resultat_n2',
    nom: 'Variation du résultat N/N-2',
    formule: '((RN N - RN N-2) / |RN N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 5, red: 0 },
    inverse: false,
    unite: '%',
  },
  variation_marge_commerciale_n1: {
    id: 'variation_marge_commerciale_n1',
    nom: 'Variation marge commerciale N/N-1',
    formule: '((Taux marge comm. N - Taux N-1) / |Taux N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 10, red: -5 },
    inverse: false,
    unite: '%',
  },
  variation_marge_commerciale_n2: {
    id: 'variation_marge_commerciale_n2',
    nom: 'Variation marge commerciale N/N-2',
    formule: '((Taux marge comm. N - Taux N-2) / |Taux N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 10, red: -5 },
    inverse: false,
    unite: '%',
  },
  variation_marge_brute_n1: {
    id: 'variation_marge_brute_n1',
    nom: 'Variation marge brute N/N-1',
    formule: '((Taux marge brute N - Taux N-1) / |Taux N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 10, red: -5 },
    inverse: false,
    unite: '%',
  },
  variation_marge_brute_n2: {
    id: 'variation_marge_brute_n2',
    nom: 'Variation marge brute N/N-2',
    formule: '((Taux marge brute N - Taux N-2) / |Taux N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 10, red: -5 },
    inverse: false,
    unite: '%',
  },
  variation_charges_personnel_va_n1: {
    id: 'variation_charges_personnel_va_n1',
    nom: 'Variation charges personnel/VA N/N-1',
    formule: '((Charges perso/VA N - Taux N-1) / |Taux N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 0, red: 5 },
    inverse: true, // Hausse des charges = mauvais
    unite: '%',
  },
  variation_charges_personnel_va_n2: {
    id: 'variation_charges_personnel_va_n2',
    nom: 'Variation charges personnel/VA N/N-2',
    formule: '((Charges perso/VA N - Taux N-2) / |Taux N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 0, red: 5 },
    inverse: true, // Hausse des charges = mauvais
    unite: '%',
  },
  variation_charges_financieres_va_n1: {
    id: 'variation_charges_financieres_va_n1',
    nom: 'Variation charges financières/VA N/N-1',
    formule: '((Charges fin/VA N - Taux N-1) / |Taux N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 0, red: 5 },
    inverse: true, // Hausse des charges = mauvais
    unite: '%',
  },
  variation_charges_financieres_va_n2: {
    id: 'variation_charges_financieres_va_n2',
    nom: 'Variation charges financières/VA N/N-2',
    formule: '((Charges fin/VA N - Taux N-2) / |Taux N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 0, red: 5 },
    inverse: true, // Hausse des charges = mauvais
    unite: '%',
  },
  variation_impots_va_n1: {
    id: 'variation_impots_va_n1',
    nom: 'Variation impôts/VA N/N-1',
    formule: '((Impôts/VA N - Taux N-1) / |Taux N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 0, red: 5 },
    inverse: true, // Hausse des impôts = mauvais
    unite: '%',
  },
  variation_impots_va_n2: {
    id: 'variation_impots_va_n2',
    nom: 'Variation impôts/VA N/N-2',
    formule: '((Impôts/VA N - Taux N-2) / |Taux N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 0, red: 5 },
    inverse: true, // Hausse des impôts = mauvais
    unite: '%',
  },
  variation_rotation_stocks_n1: {
    id: 'variation_rotation_stocks_n1',
    nom: 'Variation rotation stocks N/N-1',
    formule: '((Rotation N - Rotation N-1) / |Rotation N-1|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 10, red: 10 },
    inverse: true, // Hausse de la durée de rotation = mauvais
    unite: '%',
  },
  variation_rotation_stocks_n2: {
    id: 'variation_rotation_stocks_n2',
    nom: 'Variation rotation stocks N/N-2',
    formule: '((Rotation N - Rotation N-2) / |Rotation N-2|) × 100',
    famille: 'evolution',
    seuils: { type: 'fixed', green: 10, red: 10 },
    inverse: true, // Hausse de la durée de rotation = mauvais
    unite: '%',
  },
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Récupère les ratios d'une famille donnée
 */
export function getRatiosByFamily(familyId: FamilyId): RatioDefinition[] {
  return Object.values(RATIOS).filter((ratio) => ratio.famille === familyId)
}

/**
 * Récupère toutes les familles avec leurs ratios
 */
export function getFamiliesWithRatios(): Array<{
  family: FamilyDefinition
  ratios: RatioDefinition[]
}> {
  return Object.values(RATIO_FAMILIES).map((family) => ({
    family,
    ratios: getRatiosByFamily(family.id),
  }))
}

/**
 * Évalue un ratio par rapport à ses seuils fixes
 * @returns "green" | "yellow" | "red"
 */
export function evaluateFixedThreshold(
  value: number,
  threshold: FixedThreshold,
  inverse: boolean
): 'green' | 'yellow' | 'red' {
  if (inverse) {
    // Plus c'est bas, mieux c'est
    if (value <= threshold.green) return 'green'
    if (value >= threshold.red) return 'red'
    return 'yellow'
  } else {
    // Plus c'est haut, mieux c'est
    if (value >= threshold.green) return 'green'
    if (value <= threshold.red) return 'red'
    return 'yellow'
  }
}

/**
 * Évalue un ratio par rapport aux quartiles Banque de France
 * @param value Valeur du ratio
 * @param q1 Premier quartile (25%)
 * @param q3 Troisième quartile (75%)
 * @param inverse true si plus bas = mieux
 * @returns "green" | "yellow" | "red"
 */
export function evaluateQuartileThreshold(
  value: number,
  q1: number,
  q3: number,
  inverse: boolean
): 'green' | 'yellow' | 'red' {
  if (inverse) {
    // Plus c'est bas, mieux c'est (ex: taux d'endettement)
    if (value <= q1) return 'green'
    if (value >= q3) return 'red'
    return 'yellow'
  } else {
    // Plus c'est haut, mieux c'est (ex: rentabilité)
    if (value >= q3) return 'green'
    if (value <= q1) return 'red'
    return 'yellow'
  }
}

/**
 * Calcule le score d'un ratio (0-100)
 * @param evaluation Résultat de l'évaluation
 * @returns Score entre 0 et 100
 */
export function getScoreFromEvaluation(evaluation: 'green' | 'yellow' | 'red'): number {
  switch (evaluation) {
    case 'green':
      return 100
    case 'yellow':
      return 50
    case 'red':
      return 0
  }
}

/**
 * Vérifie que la somme des poids des familles est bien 100%
 */
export function validateFamilyWeights(): boolean {
  const totalWeight = Object.values(RATIO_FAMILIES).reduce((sum, family) => sum + family.poids, 0)
  return totalWeight === 100
}

// Vérification au chargement du module
if (!validateFamilyWeights()) {
  console.warn("Attention: La somme des poids des familles de ratios n'est pas égale à 100%")
}
