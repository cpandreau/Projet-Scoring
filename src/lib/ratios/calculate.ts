/**
 * Fonctions de calcul des ratios financiers
 * À partir des données extraites de la liasse fiscale (CERFA 2050-2059 ou 2033)
 *
 * CONVENTIONS DE CALCUL (conformes aux standards comptables français) :
 * ======================================================================
 *
 * VA (Valeur Ajoutée) - conforme au 2033-E :
 *   VA = CA + Subventions d'exploitation
 *        - Achats marchandises - Achats MP - Autres charges externes
 *   Note : La variation de stocks n'est pas ajoutée car déjà incluse dans les achats
 *          en liasse simplifiée (les achats sont "net de variation de stocks")
 *
 * EBE (Excédent Brut d'Exploitation) :
 *   EBE = CA - Achats marchandises - Achats MP - Charges externes
 *         - Impôts et taxes - Charges personnel + Subventions exploitation
 *
 * CAF (Capacité d'Autofinancement) :
 *   CAF = Résultat net + Dotations amortissements et provisions - Reprises sur provisions
 *   Note : Si dotations = null/0, la CAF sera sous-estimée (log warning en dev)
 *
 * FRNG (Fonds de Roulement Net Global) :
 *   FRNG = Capitaux propres + Provisions risques et charges + Dettes financières - Actif immobilisé
 *
 * BFR (Besoin en Fonds de Roulement) :
 *   BFR = Stocks + Créances clients - Dettes fournisseurs - Dettes fiscales et sociales
 *
 * Capitaux permanents :
 *   CP + Provisions risques et charges + Dettes financières LT
 *   (Dettes financières LT = Dettes financières - Découvert bancaire)
 *
 * Passif circulant :
 *   Dettes fournisseurs + Dettes fiscales et sociales + Découvert bancaire
 *   Note : En liasse simplifiée, le découvert n'est pas isolable (traité comme 0)
 */

import type { ExtractionData, ExtractionValues } from '@/schemas/extraction.schema'
import { extractValues } from '@/schemas/extraction.schema'

// Type pour les résultats des ratios calculés
export interface CalculatedRatios {
  // Liquidité
  liquidite_generale: number | null
  liquidite_immediate: number | null
  couverture_bfr: number | null

  // Rentabilité
  taux_rentabilite_financiere: number | null
  rentabilite_economique: number | null
  taux_va: number | null
  taux_ebe: number | null
  taux_marge_brute: number | null
  taux_marge_industrielle: number | null
  taux_marge_commerciale: number | null
  rentabilite_commerciale: number | null
  charges_personnel_va: number | null
  charges_financieres_va: number | null
  impots_taxes_va: number | null

  // Solvabilité
  capacite_remboursement: number | null
  taux_endettement: number | null
  autonomie_financiere: number | null
  equilibre_global: number | null
  poids_decouvert: number | null

  // Activité
  ratio_fonds_roulement: number | null
  delai_fournisseurs: number | null
  delai_clients: number | null
  rotation_stocks: number | null
  cash_flow_exploitation: number | null

  // Évolution (nécessite données N-1 et/ou N-2)
  variation_ca_n1: number | null
  variation_ca_n2: number | null
  variation_va_n1: number | null
  variation_va_n2: number | null
  variation_resultat_n1: number | null
  variation_resultat_n2: number | null
  variation_marge_commerciale_n1: number | null
  variation_marge_commerciale_n2: number | null
  variation_marge_brute_n1: number | null
  variation_marge_brute_n2: number | null
  variation_charges_personnel_va_n1: number | null
  variation_charges_personnel_va_n2: number | null
  variation_charges_financieres_va_n1: number | null
  variation_charges_financieres_va_n2: number | null
  variation_impots_va_n1: number | null
  variation_impots_va_n2: number | null
  variation_rotation_stocks_n1: number | null
  variation_rotation_stocks_n2: number | null
}

// Type pour les agrégats intermédiaires
export interface IntermediateAggregates {
  total_passif: number | null
  passif_circulant: number | null
  capitaux_permanents: number | null
  bfr: number | null
  frng: number | null
  va: number | null
  ebe: number | null
  caf: number | null
  marge_brute: number | null
  marge_commerciale: number | null
}

/**
 * Division sécurisée - retourne null si diviseur est 0 ou null
 */
function safeDivide(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator === 0) {
    return null
  }
  return numerator / denominator
}

/**
 * Multiplication avec gestion des null
 */
function safeMultiply(...values: (number | null)[]): number | null {
  if (values.some((v) => v === null)) {
    return null
  }
  return values.reduce((acc, v) => (acc as number) * (v as number), 1) as number
}

/**
 * Addition avec gestion des null
 */
function safeAdd(...values: (number | null)[]): number | null {
  if (values.some((v) => v === null)) {
    return null
  }
  return values.reduce((acc, v) => (acc as number) + (v as number), 0) as number
}

/**
 * Soustraction avec gestion des null
 */
function safeSubtract(a: number | null, b: number | null): number | null {
  if (a === null || b === null) {
    return null
  }
  return a - b
}

// ============================================================================
// FONCTIONS DE CALCUL DES AGRÉGATS INTERMÉDIAIRES
// ============================================================================

/**
 * Calcule le Passif Circulant
 * Passif circulant = Dettes fournisseurs + Dettes fiscales et sociales + Découvert bancaire
 *
 * Note : En liasse simplifiée (2033), le découvert bancaire n'est pas isolable
 * (inclus dans emprunts case 156). Dans ce cas, decouvert_bancaire sera null
 * et sera traité comme 0 dans le calcul.
 */
export function calculatePassifCirculant(donnees: ExtractionValues): number | null {
  const { dettes_fournisseurs, dettes_fiscales_sociales, decouvert_bancaire } = donnees

  // Utiliser 0 si les valeurs sont null (notamment découvert en liasse simplifiée)
  const dettes_fs = dettes_fiscales_sociales ?? 0
  const decouvert = decouvert_bancaire ?? 0

  const passif_circulant = safeAdd(safeAdd(dettes_fournisseurs, dettes_fs), decouvert)

  return passif_circulant
}

/**
 * Calcule les Capitaux Permanents
 * Capitaux permanents = Capitaux propres + Provisions risques et charges + Dettes financières - Découvert bancaire
 *
 * Note : Les dettes financières incluent généralement le découvert, donc on le soustrait
 * pour obtenir les dettes financières à long terme uniquement.
 */
export function calculateCapitauxPermanents(donnees: ExtractionValues): number | null {
  const { capitaux_propres, provisions_risques_charges, dettes_financieres, decouvert_bancaire } =
    donnees

  // Capitaux propres + Provisions
  const cp_provisions = safeAdd(capitaux_propres, provisions_risques_charges ?? 0)

  // Dettes financières long terme = Dettes financières - Découvert
  const dettes_lt = safeSubtract(dettes_financieres, decouvert_bancaire ?? 0)

  // Capitaux permanents = CP + Provisions + Dettes LT
  return safeAdd(cp_provisions, dettes_lt)
}

/**
 * Calcule le FRNG (Fonds de Roulement Net Global)
 * FRNG = Capitaux propres + Provisions pour risques et charges + Dettes financières - Actif immobilisé
 */
export function calculateFRNG(donnees: ExtractionValues): number | null {
  const { capitaux_propres, provisions_risques_charges, dettes_financieres, actif_immobilise } =
    donnees
  const ressources_stables = safeAdd(
    safeAdd(capitaux_propres, provisions_risques_charges ?? 0),
    dettes_financieres
  )
  return safeSubtract(ressources_stables, actif_immobilise)
}

/**
 * Calcule le BFR (Besoin en Fonds de Roulement)
 * BFR = Stocks + Créances clients - Dettes fournisseurs - Dettes fiscales et sociales
 */
export function calculateBFR(donnees: ExtractionValues): number | null {
  const { stocks, creances_clients, dettes_fournisseurs, dettes_fiscales_sociales } = donnees
  const actif_exploitation = safeAdd(stocks, creances_clients)
  const passif_exploitation = safeAdd(dettes_fournisseurs, dettes_fiscales_sociales ?? 0)
  return safeSubtract(actif_exploitation, passif_exploitation)
}

/**
 * Calcule la Valeur Ajoutée (VA)
 * Formule conforme au 2033-E (liasse simplifiée) :
 * VA = CA + Subventions d'exploitation - Achats marchandises - Achats MP - Autres charges externes
 *
 * Note : La variation de stocks n'est pas ajoutée car déjà incluse dans les achats
 * en liasse simplifiée (les achats sont "net de variation de stocks")
 */
export function calculateVAFromData(donnees: ExtractionValues): number | null {
  const {
    chiffre_affaires,
    achats_marchandises,
    achats_matieres_premieres,
    autres_charges_externes,
    subventions_exploitation,
  } = donnees

  // Base : CA + Subventions d'exploitation (si disponibles)
  let ca_ajuste = chiffre_affaires
  if (subventions_exploitation !== null && subventions_exploitation > 0) {
    ca_ajuste = safeAdd(chiffre_affaires, subventions_exploitation)
  }

  const va = safeSubtract(
    safeSubtract(safeSubtract(ca_ajuste, achats_marchandises), achats_matieres_premieres),
    autres_charges_externes
  )

  return va
}

/**
 * Calcule l'EBE (Excédent Brut d'Exploitation)
 * EBE = CA - Achats marchandises - Achats MP - Autres charges externes
 *       - Impôts et taxes - Charges de personnel + Subventions d'exploitation
 *
 * Ou : EBE = VA - Impôts et taxes - Charges de personnel + Subventions d'exploitation
 */
export function calculateEBE(donnees: ExtractionValues): number | null {
  const {
    chiffre_affaires,
    achats_marchandises,
    achats_matieres_premieres,
    autres_charges_externes,
    impots_taxes,
    charges_personnel,
    subventions_exploitation,
  } = donnees

  // Marge sur consommations = CA - Achats - Charges externes
  const marge_consommations = safeSubtract(
    safeSubtract(safeSubtract(chiffre_affaires, achats_marchandises), achats_matieres_premieres),
    autres_charges_externes
  )

  // EBE = Marge - Impôts - Charges personnel + Subventions
  const ebe_avant_subventions = safeSubtract(
    safeSubtract(marge_consommations, impots_taxes),
    charges_personnel
  )

  // Ajoute les subventions d'exploitation si disponibles
  const ebe =
    subventions_exploitation && subventions_exploitation > 0
      ? safeAdd(ebe_avant_subventions, subventions_exploitation)
      : ebe_avant_subventions

  return ebe
}

/**
 * Calcule la Marge Commerciale
 * Marge commerciale = Ventes de marchandises - Achats de marchandises - Variation stocks marchandises
 *
 * Note : La variation de stocks marchandises est incluse dans variation_stocks
 * mais représente la production stockée (différent). On utilise une approximation.
 */
export function calculateMargeCommerciale(donnees: ExtractionValues): number | null {
  const { ventes_marchandises, achats_marchandises } = donnees

  // Si pas de ventes de marchandises, c'est une entreprise de services/production
  if (ventes_marchandises === null || ventes_marchandises === 0) {
    return null
  }

  // Marge commerciale = Ventes - Achats
  // Note : idéalement on soustrairait aussi la variation de stock marchandises
  return safeSubtract(ventes_marchandises, achats_marchandises)
}

/**
 * Calcule la CAF (Capacité d'AutoFinancement)
 * Formule simplifiée (champs disponibles en liasse fiscale) :
 * CAF = Résultat net + Dotations aux amortissements et provisions - Reprises sur provisions
 *
 * Formule complète (non utilisée car données non disponibles) :
 * CAF = Résultat net
 *       + Dotations aux amortissements et provisions
 *       - Reprises sur provisions
 *       + Valeur nette comptable des éléments d'actif cédés
 *       - Produits de cession des éléments d'actif
 *
 * Note : Si dotations_amortissements est null ou 0, la CAF sera sous-estimée
 */
export function calculateCAF(donnees: ExtractionValues): number | null {
  const { resultat_net, dotations_amortissements, reprises_provisions } = donnees

  // Si résultat net non disponible, CAF ne peut pas être calculée
  if (resultat_net === null) {
    return null
  }

  // Warning en dev si dotations non disponibles (CAF potentiellement sous-estimée)
  if (process.env.NODE_ENV === 'development') {
    if (dotations_amortissements === null || dotations_amortissements === 0) {
      console.warn(
        '[RATIOS] CAF: dotations_amortissements est null ou 0, la CAF sera sous-estimée (= Résultat net uniquement)'
      )
    }
  }

  // Formule simplifiée : CAF = Résultat net + Dotations - Reprises
  let caf = resultat_net

  // Ajoute les dotations si disponibles (sinon 0)
  if (dotations_amortissements !== null && dotations_amortissements !== undefined) {
    caf += dotations_amortissements
  }

  // Soustrait les reprises si disponibles (sinon 0)
  if (reprises_provisions !== null && reprises_provisions !== undefined) {
    caf -= reprises_provisions
  }

  return caf
}

/**
 * Calcule les agrégats intermédiaires nécessaires pour les ratios
 */
export function calculateIntermediates(donnees: ExtractionValues): IntermediateAggregates {
  const { actif_immobilise, actif_circulant, chiffre_affaires, achats_marchandises } = donnees

  // Total passif = Total actif (équation du bilan)
  const total_passif = safeAdd(actif_immobilise, actif_circulant)

  // Passif circulant (formule corrigée)
  const passif_circulant = calculatePassifCirculant(donnees)

  // Capitaux permanents (ressources stables hors découvert)
  const capitaux_permanents = calculateCapitauxPermanents(donnees)

  // BFR (formule corrigée)
  const bfr = calculateBFR(donnees)

  // FRNG (formule corrigée avec provisions)
  const frng = calculateFRNG(donnees)

  // Valeur Ajoutée
  const va = calculateVAFromData(donnees)

  // Marge brute = CA - Achats de marchandises
  const marge_brute = safeSubtract(chiffre_affaires, achats_marchandises)

  // Marge commerciale (pour activité de négoce)
  const marge_commerciale = calculateMargeCommerciale(donnees)

  // EBE (formule corrigée avec subventions)
  const ebe = calculateEBE(donnees)

  // CAF (nouveau calcul)
  const caf = calculateCAF(donnees)

  return {
    total_passif,
    passif_circulant,
    capitaux_permanents,
    bfr,
    frng,
    va,
    ebe,
    caf,
    marge_brute,
    marge_commerciale,
  }
}

/**
 * Calcule tous les ratios de liquidité
 */
function calculateLiquiditeRatios(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates
): Pick<CalculatedRatios, 'liquidite_generale' | 'liquidite_immediate' | 'couverture_bfr'> {
  const { actif_circulant, disponibilites } = donnees
  const { passif_circulant, bfr, frng } = intermediates

  // Liquidité générale = Actif circulant / Passif circulant × 100
  const liquidite_generale = safeMultiply(safeDivide(actif_circulant, passif_circulant), 100)

  // Liquidité immédiate = Disponibilités / Passif circulant × 100
  const liquidite_immediate = safeMultiply(safeDivide(disponibilites, passif_circulant), 100)

  // Couverture du BFR = BFR / FRNG × 100
  const couverture_bfr = safeMultiply(safeDivide(bfr, frng), 100)

  return {
    liquidite_generale,
    liquidite_immediate,
    couverture_bfr,
  }
}

/**
 * Calcule tous les ratios de rentabilité
 */
function calculateRentabiliteRatios(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates
): Pick<
  CalculatedRatios,
  | 'taux_rentabilite_financiere'
  | 'rentabilite_economique'
  | 'taux_va'
  | 'taux_ebe'
  | 'taux_marge_brute'
  | 'taux_marge_industrielle'
  | 'taux_marge_commerciale'
  | 'rentabilite_commerciale'
  | 'charges_personnel_va'
  | 'charges_financieres_va'
  | 'impots_taxes_va'
> {
  const {
    resultat_net,
    capitaux_propres,
    actif_immobilise,
    chiffre_affaires,
    charges_personnel,
    charges_financieres,
    impots_taxes,
    production,
    achats_matieres_premieres,
    autres_charges_externes,
    ventes_marchandises,
  } = donnees
  const { bfr, va, ebe, caf, marge_commerciale } = intermediates

  // Taux de rentabilité financière = CAF / Capitaux propres × 100
  // (Selon doc référence : "CAF nette / Capitaux propres")
  const taux_rentabilite_financiere = safeMultiply(safeDivide(caf, capitaux_propres), 100)

  // Rentabilité économique = EBE / (Actif immobilisé + BFR) × 100
  const capitaux_investis = safeAdd(actif_immobilise, bfr)
  const rentabilite_economique = safeMultiply(safeDivide(ebe, capitaux_investis), 100)

  // Taux de VA = VA / CA × 100
  const taux_va = safeMultiply(safeDivide(va, chiffre_affaires), 100)

  // Taux d'EBE = EBE / CA × 100
  const taux_ebe = safeMultiply(safeDivide(ebe, chiffre_affaires), 100)

  // Taux de marge brute = EBE / VA × 100
  const taux_marge_brute = safeMultiply(safeDivide(ebe, va), 100)

  // Taux de marge industrielle = (Production - Achats MP - Charges ext) / Production × 100
  const marge_industrielle = safeSubtract(
    safeSubtract(production, achats_matieres_premieres),
    autres_charges_externes
  )
  const taux_marge_industrielle = safeMultiply(safeDivide(marge_industrielle, production), 100)

  // Taux de marge commerciale = Marge commerciale / Ventes marchandises × 100
  // Retourne null si pas de ventes de marchandises (entreprise de services/production)
  const taux_marge_commerciale =
    ventes_marchandises === null || ventes_marchandises === 0
      ? null
      : safeMultiply(safeDivide(marge_commerciale, ventes_marchandises), 100)

  // Rentabilité commerciale = Résultat net / CA × 100
  const rentabilite_commerciale = safeMultiply(safeDivide(resultat_net, chiffre_affaires), 100)

  // Charges de personnel / VA × 100
  const charges_personnel_va = safeMultiply(safeDivide(charges_personnel, va), 100)

  // Charges financières / VA × 100
  const charges_financieres_va = safeMultiply(safeDivide(charges_financieres, va), 100)

  // Impôts et taxes / VA × 100
  const impots_taxes_va = safeMultiply(safeDivide(impots_taxes, va), 100)

  return {
    taux_rentabilite_financiere,
    rentabilite_economique,
    taux_va,
    taux_ebe,
    taux_marge_brute,
    taux_marge_industrielle,
    taux_marge_commerciale,
    rentabilite_commerciale,
    charges_personnel_va,
    charges_financieres_va,
    impots_taxes_va,
  }
}

/**
 * Calcule tous les ratios de solvabilité
 */
function calculateSolvabiliteRatios(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates
): Pick<
  CalculatedRatios,
  | 'capacite_remboursement'
  | 'taux_endettement'
  | 'autonomie_financiere'
  | 'equilibre_global'
  | 'poids_decouvert'
> {
  const { dettes_financieres, capitaux_propres, actif_immobilise, decouvert_bancaire } = donnees
  const { total_passif, bfr, caf, capitaux_permanents } = intermediates

  // Capacité de remboursement = (Dettes financières / CAF) × 360 jours
  // Retourne null si CAF <= 0 (ratio non significatif)
  let capacite_remboursement: number | null = null
  if (caf !== null && caf > 0 && dettes_financieres !== null) {
    capacite_remboursement = (dettes_financieres / caf) * 360
  }

  // Taux d'endettement = Dettes financières / Capitaux propres × 100
  const taux_endettement = safeMultiply(safeDivide(dettes_financieres, capitaux_propres), 100)

  // Autonomie financière = Capitaux propres / Total passif × 100
  const autonomie_financiere = safeMultiply(safeDivide(capitaux_propres, total_passif), 100)

  // Équilibre financier global = Capitaux permanents / (Actif immobilisé + BFR) × 100
  // Capitaux permanents = CP + Provisions + Dettes financières LT (hors découvert)
  const emplois_stables = safeAdd(actif_immobilise, bfr)
  const equilibre_global = safeMultiply(safeDivide(capitaux_permanents, emplois_stables), 100)

  // Poids du découvert = Découvert bancaire / Dettes financières × 100
  const poids_decouvert = safeMultiply(safeDivide(decouvert_bancaire, dettes_financieres), 100)

  return {
    capacite_remboursement,
    taux_endettement,
    autonomie_financiere,
    equilibre_global,
    poids_decouvert,
  }
}

/**
 * Calcule tous les ratios d'activité
 */
function calculateActiviteRatios(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates,
  donneesN1?: ExtractionValues
): Pick<
  CalculatedRatios,
  | 'ratio_fonds_roulement'
  | 'delai_fournisseurs'
  | 'delai_clients'
  | 'rotation_stocks'
  | 'cash_flow_exploitation'
> {
  const {
    actif_immobilise,
    dettes_fournisseurs,
    achats_marchandises,
    achats_matieres_premieres,
    autres_charges_externes,
    creances_clients,
    chiffre_affaires,
    stocks,
  } = donnees
  const { ebe, bfr, capitaux_permanents } = intermediates

  // Ratio de fonds de roulement = Capitaux permanents / Actif immobilisé
  // Seuils : < 1 = rouge, 1-1.2 = jaune, > 1.2 = vert
  const ratio_fonds_roulement = safeDivide(capitaux_permanents, actif_immobilise)

  // Délai fournisseurs = (Dettes fournisseurs × 360) / (Achats TTC)
  // Achats TTC = (Achats + Charges externes) × 1.2 (TVA 20%)
  const achats_ht = safeAdd(
    safeAdd(achats_marchandises, achats_matieres_premieres),
    autres_charges_externes
  )
  const achats_ttc = safeMultiply(achats_ht, 1.2)
  const delai_fournisseurs = safeDivide(safeMultiply(dettes_fournisseurs, 360), achats_ttc)

  // Délai clients = (Créances clients × 360) / (CA TTC)
  const ca_ttc = safeMultiply(chiffre_affaires, 1.2)
  const delai_clients = safeDivide(safeMultiply(creances_clients, 360), ca_ttc)

  // Rotation des stocks = (Stocks × 360) / (Achats marchandises + Achats MP)
  const total_achats = safeAdd(achats_marchandises, achats_matieres_premieres)
  const rotation_stocks = safeDivide(safeMultiply(stocks, 360), total_achats)

  // Cash flow d'exploitation = EBE / (BFR_N - BFR_N1)
  // Retourne null si pas de données N-1 ou si variation BFR = 0
  let cash_flow_exploitation: number | null = null
  if (donneesN1) {
    const intermediatesN1 = calculateIntermediates(donneesN1)
    const bfr_n1 = intermediatesN1.bfr
    const variation_bfr = safeSubtract(bfr, bfr_n1)
    if (variation_bfr !== null && variation_bfr !== 0) {
      cash_flow_exploitation = safeDivide(ebe, variation_bfr)
    }
  }

  return {
    ratio_fonds_roulement,
    delai_fournisseurs,
    delai_clients,
    rotation_stocks,
    cash_flow_exploitation,
  }
}

/**
 * Calcule la variation en pourcentage avec valeur absolue au dénominateur
 */
function calculateVariation(valueN: number | null, valuePrev: number | null): number | null {
  if (valueN === null || valuePrev === null || valuePrev === 0) {
    return null
  }
  return ((valueN - valuePrev) / Math.abs(valuePrev)) * 100
}

/**
 * Calcule la VA à partir des données extraites
 * (Wrapper pour calculateVAFromData pour compatibilité)
 */
function calculateVA(donnees: ExtractionValues): number | null {
  return calculateVAFromData(donnees)
}

/**
 * Calcule le taux de marge commerciale = (ventes_marchandises - achats_marchandises) / CA
 */
function calculateTauxMargeCommerciale(donnees: ExtractionValues): number | null {
  const marge = safeSubtract(donnees.ventes_marchandises, donnees.achats_marchandises)
  return safeDivide(marge, donnees.chiffre_affaires)
}

/**
 * Calcule le taux de marge brute = EBE / VA
 */
function calculateTauxMargeBrute(donnees: ExtractionValues): number | null {
  const va = calculateVAFromData(donnees)
  const ebe = calculateEBE(donnees)
  return safeDivide(ebe, va)
}

/**
 * Calcule charges personnel / VA
 */
function calculateChargesPersonnelVA(donnees: ExtractionValues): number | null {
  const va = calculateVAFromData(donnees)
  return safeDivide(donnees.charges_personnel, va)
}

/**
 * Calcule charges financières / VA
 */
function calculateChargesFinancieresVA(donnees: ExtractionValues): number | null {
  const va = calculateVAFromData(donnees)
  return safeDivide(donnees.charges_financieres, va)
}

/**
 * Calcule impôts et taxes / VA
 */
function calculateImpotsVA(donnees: ExtractionValues): number | null {
  const va = calculateVAFromData(donnees)
  return safeDivide(donnees.impots_taxes, va)
}

/**
 * Calcule la rotation des stocks = (Stocks × 360) / (Achats march. + Achats MP)
 */
function calculateRotationStocks(donnees: ExtractionValues): number | null {
  const total_achats = safeAdd(donnees.achats_marchandises, donnees.achats_matieres_premieres)
  return safeDivide(safeMultiply(donnees.stocks, 360), total_achats)
}

/**
 * Calcule la variation d'un ratio entre deux années
 * variation = ((ratio_N - ratio_prev) / |ratio_prev|) × 100
 */
function calculateRatioVariation(ratioN: number | null, ratioPrev: number | null): number | null {
  if (ratioN === null || ratioPrev === null || ratioPrev === 0) {
    return null
  }
  return ((ratioN - ratioPrev) / Math.abs(ratioPrev)) * 100
}

/**
 * Calcule les ratios d'évolution (nécessite données N-1 et/ou N-2)
 */
function calculateEvolutionRatios(
  donnees: ExtractionValues,
  donneesN1?: ExtractionValues,
  donneesN2?: ExtractionValues
): Pick<
  CalculatedRatios,
  | 'variation_ca_n1'
  | 'variation_ca_n2'
  | 'variation_va_n1'
  | 'variation_va_n2'
  | 'variation_resultat_n1'
  | 'variation_resultat_n2'
  | 'variation_marge_commerciale_n1'
  | 'variation_marge_commerciale_n2'
  | 'variation_marge_brute_n1'
  | 'variation_marge_brute_n2'
  | 'variation_charges_personnel_va_n1'
  | 'variation_charges_personnel_va_n2'
  | 'variation_charges_financieres_va_n1'
  | 'variation_charges_financieres_va_n2'
  | 'variation_impots_va_n1'
  | 'variation_impots_va_n2'
  | 'variation_rotation_stocks_n1'
  | 'variation_rotation_stocks_n2'
> {
  // Calcul des VA pour chaque année
  const va_n = calculateVA(donnees)
  const va_n1 = donneesN1 ? calculateVA(donneesN1) : null
  const va_n2 = donneesN2 ? calculateVA(donneesN2) : null

  // Calcul des ratios pour l'année N
  const tauxMargeCommN = calculateTauxMargeCommerciale(donnees)
  const tauxMargeBruteN = calculateTauxMargeBrute(donnees)
  const chargesPersonnelVAN = calculateChargesPersonnelVA(donnees)
  const chargesFinancieresVAN = calculateChargesFinancieresVA(donnees)
  const impotsVAN = calculateImpotsVA(donnees)
  const rotationStocksN = calculateRotationStocks(donnees)

  // Calcul des ratios pour l'année N-1
  const tauxMargeCommN1 = donneesN1 ? calculateTauxMargeCommerciale(donneesN1) : null
  const tauxMargeBruteN1 = donneesN1 ? calculateTauxMargeBrute(donneesN1) : null
  const chargesPersonnelVAN1 = donneesN1 ? calculateChargesPersonnelVA(donneesN1) : null
  const chargesFinancieresVAN1 = donneesN1 ? calculateChargesFinancieresVA(donneesN1) : null
  const impotsVAN1 = donneesN1 ? calculateImpotsVA(donneesN1) : null
  const rotationStocksN1 = donneesN1 ? calculateRotationStocks(donneesN1) : null

  // Calcul des ratios pour l'année N-2
  const tauxMargeCommN2 = donneesN2 ? calculateTauxMargeCommerciale(donneesN2) : null
  const tauxMargeBruteN2 = donneesN2 ? calculateTauxMargeBrute(donneesN2) : null
  const chargesPersonnelVAN2 = donneesN2 ? calculateChargesPersonnelVA(donneesN2) : null
  const chargesFinancieresVAN2 = donneesN2 ? calculateChargesFinancieresVA(donneesN2) : null
  const impotsVAN2 = donneesN2 ? calculateImpotsVA(donneesN2) : null
  const rotationStocksN2 = donneesN2 ? calculateRotationStocks(donneesN2) : null

  // Variations N/N-1 de base
  const variation_ca_n1 = donneesN1
    ? calculateVariation(donnees.chiffre_affaires, donneesN1.chiffre_affaires)
    : null

  const variation_va_n1 = donneesN1 ? calculateVariation(va_n, va_n1) : null

  const variation_resultat_n1 = donneesN1
    ? calculateVariation(donnees.resultat_net, donneesN1.resultat_net)
    : null

  // Variations N/N-2 de base
  const variation_ca_n2 = donneesN2
    ? calculateVariation(donnees.chiffre_affaires, donneesN2.chiffre_affaires)
    : null

  const variation_va_n2 = donneesN2 ? calculateVariation(va_n, va_n2) : null

  const variation_resultat_n2 = donneesN2
    ? calculateVariation(donnees.resultat_net, donneesN2.resultat_net)
    : null

  // Variations des ratios N/N-1
  const variation_marge_commerciale_n1 = calculateRatioVariation(tauxMargeCommN, tauxMargeCommN1)
  const variation_marge_brute_n1 = calculateRatioVariation(tauxMargeBruteN, tauxMargeBruteN1)
  const variation_charges_personnel_va_n1 = calculateRatioVariation(
    chargesPersonnelVAN,
    chargesPersonnelVAN1
  )
  const variation_charges_financieres_va_n1 = calculateRatioVariation(
    chargesFinancieresVAN,
    chargesFinancieresVAN1
  )
  const variation_impots_va_n1 = calculateRatioVariation(impotsVAN, impotsVAN1)
  const variation_rotation_stocks_n1 = calculateRatioVariation(rotationStocksN, rotationStocksN1)

  // Variations des ratios N/N-2
  const variation_marge_commerciale_n2 = calculateRatioVariation(tauxMargeCommN, tauxMargeCommN2)
  const variation_marge_brute_n2 = calculateRatioVariation(tauxMargeBruteN, tauxMargeBruteN2)
  const variation_charges_personnel_va_n2 = calculateRatioVariation(
    chargesPersonnelVAN,
    chargesPersonnelVAN2
  )
  const variation_charges_financieres_va_n2 = calculateRatioVariation(
    chargesFinancieresVAN,
    chargesFinancieresVAN2
  )
  const variation_impots_va_n2 = calculateRatioVariation(impotsVAN, impotsVAN2)
  const variation_rotation_stocks_n2 = calculateRatioVariation(rotationStocksN, rotationStocksN2)

  return {
    variation_ca_n1,
    variation_ca_n2,
    variation_va_n1,
    variation_va_n2,
    variation_resultat_n1,
    variation_resultat_n2,
    variation_marge_commerciale_n1,
    variation_marge_commerciale_n2,
    variation_marge_brute_n1,
    variation_marge_brute_n2,
    variation_charges_personnel_va_n1,
    variation_charges_personnel_va_n2,
    variation_charges_financieres_va_n1,
    variation_charges_financieres_va_n2,
    variation_impots_va_n1,
    variation_impots_va_n2,
    variation_rotation_stocks_n1,
    variation_rotation_stocks_n2,
  }
}

/**
 * Calcule tous les ratios financiers à partir des données extraites
 *
 * @param donnees Données financières de l'année N (ExtractionData avec ValueWithSource)
 * @param donneesN1 Données financières de l'année N-1 (optionnel, pour les ratios d'évolution)
 * @param donneesN2 Données financières de l'année N-2 (optionnel, pour les ratios d'évolution sur 2 ans)
 * @returns Objet contenant tous les ratios calculés
 */
export function calculateRatios(
  donnees: ExtractionData,
  donneesN1?: ExtractionData,
  donneesN2?: ExtractionData
): CalculatedRatios {
  // Extraire les valeurs numériques des objets ValueWithSource
  const values = extractValues(donnees)
  const valuesN1 = donneesN1 ? extractValues(donneesN1) : undefined
  const valuesN2 = donneesN2 ? extractValues(donneesN2) : undefined

  // Calculer les agrégats intermédiaires
  const intermediates = calculateIntermediates(values)

  // Calculer les ratios par famille
  const liquidite = calculateLiquiditeRatios(values, intermediates)
  const rentabilite = calculateRentabiliteRatios(values, intermediates)
  const solvabilite = calculateSolvabiliteRatios(values, intermediates)
  const activite = calculateActiviteRatios(values, intermediates, valuesN1)
  const evolution = calculateEvolutionRatios(values, valuesN1, valuesN2)

  return {
    ...liquidite,
    ...rentabilite,
    ...solvabilite,
    ...activite,
    ...evolution,
  }
}

/**
 * Retourne les agrégats intermédiaires pour affichage/debug
 */
export function getIntermediates(donnees: ExtractionData): IntermediateAggregates {
  const values = extractValues(donnees)
  return calculateIntermediates(values)
}

/**
 * Compte le nombre de ratios calculables (non null)
 */
export function countCalculableRatios(ratios: CalculatedRatios): {
  total: number
  calculable: number
  percentage: number
} {
  const values = Object.values(ratios)
  const total = values.length
  const calculable = values.filter((v) => v !== null).length
  const percentage = Math.round((calculable / total) * 100)

  return { total, calculable, percentage }
}
