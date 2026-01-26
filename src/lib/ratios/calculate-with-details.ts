/**
 * Fonctions de calcul des ratios avec détails pour le debug
 * Permet de visualiser chaque étape du calcul
 */

import type { ExtractionValues } from '@/schemas/extraction.schema'
import { calculateIntermediates, type IntermediateAggregates } from './calculate'

// Type pour un calcul détaillé
export interface RatioDetail {
  valeur: number | null
  formule: string
  variables: Record<string, number | null>
  calcul: string
  unite: '%' | 'jours' | 'ratio' | '€'
}

// Type pour un agrégat détaillé
export interface AggregateDetail {
  valeur: number | null
  formule: string
  variables: Record<string, number | null>
  calcul: string
}

// Type pour le résultat complet avec détails
export interface CalculationDetails {
  // Données d'entrée
  donnees: ExtractionValues

  // Agrégats intermédiaires
  aggregats: {
    passif_circulant: AggregateDetail
    capitaux_permanents: AggregateDetail
    frng: AggregateDetail
    bfr: AggregateDetail
    va: AggregateDetail
    ebe: AggregateDetail
    caf: AggregateDetail
    marge_commerciale: AggregateDetail
    total_passif: AggregateDetail
    marge_brute: AggregateDetail
  }

  // Ratios par famille
  ratios: {
    liquidite: {
      liquidite_generale: RatioDetail
      liquidite_immediate: RatioDetail
      couverture_bfr: RatioDetail
    }
    rentabilite: {
      taux_rentabilite_financiere: RatioDetail
      rentabilite_economique: RatioDetail
      taux_va: RatioDetail
      taux_ebe: RatioDetail
      taux_marge_brute: RatioDetail
      taux_marge_industrielle: RatioDetail
      taux_marge_commerciale: RatioDetail
      rentabilite_commerciale: RatioDetail
      charges_personnel_va: RatioDetail
      charges_financieres_va: RatioDetail
      impots_taxes_va: RatioDetail
    }
    solvabilite: {
      capacite_remboursement: RatioDetail
      taux_endettement: RatioDetail
      autonomie_financiere: RatioDetail
      equilibre_global: RatioDetail
      poids_decouvert: RatioDetail
    }
    activite: {
      ratio_fonds_roulement: RatioDetail
      delai_fournisseurs: RatioDetail
      delai_clients: RatioDetail
      rotation_stocks: RatioDetail
    }
  }
}

// Helper pour formater un nombre
function fmt(n: number | null): string {
  if (n === null) return 'null'
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
  }).format(n)
}

/**
 * Calcule tous les agrégats avec leurs détails
 */
function calculateAggregatesWithDetails(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates
): CalculationDetails['aggregats'] {
  const {
    dettes_fournisseurs,
    dettes_fiscales_sociales,
    decouvert_bancaire,
    capitaux_propres,
    provisions_risques_charges,
    dettes_financieres,
    actif_immobilise,
    actif_circulant,
    stocks,
    creances_clients,
    chiffre_affaires,
    achats_marchandises,
    achats_matieres_premieres,
    autres_charges_externes,
    impots_taxes,
    charges_personnel,
    subventions_exploitation,
    resultat_net,
    dotations_amortissements,
    reprises_provisions,
    variation_stocks,
    ventes_marchandises,
  } = donnees

  // Passif circulant
  const passif_circulant: AggregateDetail = {
    valeur: intermediates.passif_circulant,
    formule: 'Dettes fournisseurs + Dettes fiscales et sociales + Découvert bancaire',
    variables: {
      dettes_fournisseurs,
      dettes_fiscales_sociales: dettes_fiscales_sociales ?? 0,
      decouvert_bancaire: decouvert_bancaire ?? 0,
    },
    calcul: `${fmt(dettes_fournisseurs)} + ${fmt(dettes_fiscales_sociales ?? 0)} + ${fmt(decouvert_bancaire ?? 0)} = ${fmt(intermediates.passif_circulant)}`,
  }

  // Capitaux permanents
  const cp_provisions = (capitaux_propres ?? 0) + (provisions_risques_charges ?? 0)
  const dettes_lt = (dettes_financieres ?? 0) - (decouvert_bancaire ?? 0)
  const capitaux_permanents: AggregateDetail = {
    valeur: intermediates.capitaux_permanents,
    formule: 'Capitaux propres + Provisions + (Dettes financières - Découvert)',
    variables: {
      capitaux_propres,
      provisions_risques_charges: provisions_risques_charges ?? 0,
      dettes_financieres,
      decouvert_bancaire: decouvert_bancaire ?? 0,
    },
    calcul: `(${fmt(capitaux_propres)} + ${fmt(provisions_risques_charges ?? 0)}) + (${fmt(dettes_financieres)} - ${fmt(decouvert_bancaire ?? 0)}) = ${fmt(cp_provisions)} + ${fmt(dettes_lt)} = ${fmt(intermediates.capitaux_permanents)}`,
  }

  // FRNG
  const ressources_stables =
    (capitaux_propres ?? 0) + (provisions_risques_charges ?? 0) + (dettes_financieres ?? 0)
  const frng: AggregateDetail = {
    valeur: intermediates.frng,
    formule: 'Capitaux propres + Provisions + Dettes financières - Actif immobilisé',
    variables: {
      capitaux_propres,
      provisions_risques_charges: provisions_risques_charges ?? 0,
      dettes_financieres,
      actif_immobilise,
    },
    calcul: `(${fmt(capitaux_propres)} + ${fmt(provisions_risques_charges ?? 0)} + ${fmt(dettes_financieres)}) - ${fmt(actif_immobilise)} = ${fmt(ressources_stables)} - ${fmt(actif_immobilise)} = ${fmt(intermediates.frng)}`,
  }

  // BFR
  const actif_exploitation = (stocks ?? 0) + (creances_clients ?? 0)
  const passif_exploitation = (dettes_fournisseurs ?? 0) + (dettes_fiscales_sociales ?? 0)
  const bfr: AggregateDetail = {
    valeur: intermediates.bfr,
    formule: 'Stocks + Créances clients - Dettes fournisseurs - Dettes fiscales et sociales',
    variables: {
      stocks,
      creances_clients,
      dettes_fournisseurs,
      dettes_fiscales_sociales: dettes_fiscales_sociales ?? 0,
    },
    calcul: `(${fmt(stocks)} + ${fmt(creances_clients)}) - (${fmt(dettes_fournisseurs)} + ${fmt(dettes_fiscales_sociales ?? 0)}) = ${fmt(actif_exploitation)} - ${fmt(passif_exploitation)} = ${fmt(intermediates.bfr)}`,
  }

  // VA
  const ca_ajuste =
    variation_stocks && variation_stocks > 0
      ? (chiffre_affaires ?? 0) + variation_stocks
      : (chiffre_affaires ?? 0)
  const consommations =
    (achats_marchandises ?? 0) + (achats_matieres_premieres ?? 0) + (autres_charges_externes ?? 0)
  const va: AggregateDetail = {
    valeur: intermediates.va,
    formule: 'CA + Variation stocks (si > 0) - Achats marchandises - Achats MP - Charges externes',
    variables: {
      chiffre_affaires,
      variation_stocks: variation_stocks ?? 0,
      achats_marchandises,
      achats_matieres_premieres,
      autres_charges_externes,
    },
    calcul:
      variation_stocks && variation_stocks > 0
        ? `(${fmt(chiffre_affaires)} + ${fmt(variation_stocks)}) - ${fmt(achats_marchandises)} - ${fmt(achats_matieres_premieres)} - ${fmt(autres_charges_externes)} = ${fmt(ca_ajuste)} - ${fmt(consommations)} = ${fmt(intermediates.va)}`
        : `${fmt(chiffre_affaires)} - ${fmt(achats_marchandises)} - ${fmt(achats_matieres_premieres)} - ${fmt(autres_charges_externes)} = ${fmt(intermediates.va)}`,
  }

  // EBE
  const marge_consommations =
    (chiffre_affaires ?? 0) -
    (achats_marchandises ?? 0) -
    (achats_matieres_premieres ?? 0) -
    (autres_charges_externes ?? 0)
  const ebe_avant_subv = marge_consommations - (impots_taxes ?? 0) - (charges_personnel ?? 0)
  const ebe: AggregateDetail = {
    valeur: intermediates.ebe,
    formule: 'CA - Achats - Charges ext - Impôts - Charges personnel + Subventions',
    variables: {
      chiffre_affaires,
      achats_marchandises,
      achats_matieres_premieres,
      autres_charges_externes,
      impots_taxes,
      charges_personnel,
      subventions_exploitation: subventions_exploitation ?? 0,
    },
    calcul:
      subventions_exploitation && subventions_exploitation > 0
        ? `(${fmt(chiffre_affaires)} - ${fmt(achats_marchandises)} - ${fmt(achats_matieres_premieres)} - ${fmt(autres_charges_externes)} - ${fmt(impots_taxes)} - ${fmt(charges_personnel)}) + ${fmt(subventions_exploitation)} = ${fmt(ebe_avant_subv)} + ${fmt(subventions_exploitation)} = ${fmt(intermediates.ebe)}`
        : `${fmt(chiffre_affaires)} - ${fmt(achats_marchandises)} - ${fmt(achats_matieres_premieres)} - ${fmt(autres_charges_externes)} - ${fmt(impots_taxes)} - ${fmt(charges_personnel)} = ${fmt(intermediates.ebe)}`,
  }

  // CAF
  const caf: AggregateDetail = {
    valeur: intermediates.caf,
    formule: 'Résultat net + Dotations amortissements - Reprises provisions',
    variables: {
      resultat_net,
      dotations_amortissements: dotations_amortissements ?? 0,
      reprises_provisions: reprises_provisions ?? 0,
    },
    calcul: `${fmt(resultat_net)} + ${fmt(dotations_amortissements ?? 0)} - ${fmt(reprises_provisions ?? 0)} = ${fmt(intermediates.caf)}`,
  }

  // Marge commerciale
  const marge_commerciale: AggregateDetail = {
    valeur: intermediates.marge_commerciale,
    formule: 'Ventes de marchandises - Achats de marchandises',
    variables: {
      ventes_marchandises,
      achats_marchandises,
    },
    calcul:
      ventes_marchandises === null || ventes_marchandises === 0
        ? 'Non applicable (pas de ventes de marchandises)'
        : `${fmt(ventes_marchandises)} - ${fmt(achats_marchandises)} = ${fmt(intermediates.marge_commerciale)}`,
  }

  // Total passif
  const total_passif: AggregateDetail = {
    valeur: intermediates.total_passif,
    formule: 'Actif immobilisé + Actif circulant (équation du bilan)',
    variables: {
      actif_immobilise,
      actif_circulant,
    },
    calcul: `${fmt(actif_immobilise)} + ${fmt(actif_circulant)} = ${fmt(intermediates.total_passif)}`,
  }

  // Marge brute
  const marge_brute: AggregateDetail = {
    valeur: intermediates.marge_brute,
    formule: "Chiffre d'affaires - Achats de marchandises",
    variables: {
      chiffre_affaires,
      achats_marchandises,
    },
    calcul: `${fmt(chiffre_affaires)} - ${fmt(achats_marchandises)} = ${fmt(intermediates.marge_brute)}`,
  }

  return {
    passif_circulant,
    capitaux_permanents,
    frng,
    bfr,
    va,
    ebe,
    caf,
    marge_commerciale,
    total_passif,
    marge_brute,
  }
}

/**
 * Calcule les ratios de liquidité avec détails
 */
function calculateLiquiditeDetails(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates
): CalculationDetails['ratios']['liquidite'] {
  const { actif_circulant, disponibilites } = donnees
  const { passif_circulant, bfr, frng } = intermediates

  // Liquidité générale
  const liq_gen_ratio =
    passif_circulant && passif_circulant !== 0 ? (actif_circulant ?? 0) / passif_circulant : null
  const liq_gen_pct = liq_gen_ratio !== null ? liq_gen_ratio * 100 : null

  const liquidite_generale: RatioDetail = {
    valeur: liq_gen_pct,
    formule: '(Actif circulant / Passif circulant) × 100',
    variables: { actif_circulant, passif_circulant },
    calcul:
      passif_circulant === 0 || passif_circulant === null
        ? 'Division par 0 impossible'
        : `(${fmt(actif_circulant)} / ${fmt(passif_circulant)}) × 100 = ${fmt(liq_gen_ratio)} × 100 = ${fmt(liq_gen_pct)}`,
    unite: '%',
  }

  // Liquidité immédiate
  const liq_imm_ratio =
    passif_circulant && passif_circulant !== 0 ? (disponibilites ?? 0) / passif_circulant : null
  const liq_imm_pct = liq_imm_ratio !== null ? liq_imm_ratio * 100 : null

  const liquidite_immediate: RatioDetail = {
    valeur: liq_imm_pct,
    formule: '(Disponibilités / Passif circulant) × 100',
    variables: { disponibilites, passif_circulant },
    calcul:
      passif_circulant === 0 || passif_circulant === null
        ? 'Division par 0 impossible'
        : `(${fmt(disponibilites)} / ${fmt(passif_circulant)}) × 100 = ${fmt(liq_imm_ratio)} × 100 = ${fmt(liq_imm_pct)}`,
    unite: '%',
  }

  // Couverture BFR
  const couv_ratio = frng && frng !== 0 ? (bfr ?? 0) / frng : null
  const couv_pct = couv_ratio !== null ? couv_ratio * 100 : null

  const couverture_bfr: RatioDetail = {
    valeur: couv_pct,
    formule: '(BFR / FRNG) × 100',
    variables: { bfr, frng },
    calcul:
      frng === 0 || frng === null
        ? 'Division par 0 impossible'
        : `(${fmt(bfr)} / ${fmt(frng)}) × 100 = ${fmt(couv_ratio)} × 100 = ${fmt(couv_pct)}`,
    unite: '%',
  }

  return { liquidite_generale, liquidite_immediate, couverture_bfr }
}

/**
 * Calcule les ratios de rentabilité avec détails
 */
function calculateRentabiliteDetails(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates
): CalculationDetails['ratios']['rentabilite'] {
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

  // Taux de rentabilité financière
  const rent_fin_ratio =
    capitaux_propres && capitaux_propres !== 0 ? (caf ?? 0) / capitaux_propres : null
  const rent_fin_pct = rent_fin_ratio !== null ? rent_fin_ratio * 100 : null

  const taux_rentabilite_financiere: RatioDetail = {
    valeur: rent_fin_pct,
    formule: '(CAF / Capitaux propres) × 100',
    variables: { caf, capitaux_propres },
    calcul:
      capitaux_propres === 0 || capitaux_propres === null
        ? 'Division par 0 impossible'
        : `(${fmt(caf)} / ${fmt(capitaux_propres)}) × 100 = ${fmt(rent_fin_ratio)} × 100 = ${fmt(rent_fin_pct)}`,
    unite: '%',
  }

  // Rentabilité économique
  const cap_investis = (actif_immobilise ?? 0) + (bfr ?? 0)
  const rent_eco_ratio = cap_investis !== 0 ? (ebe ?? 0) / cap_investis : null
  const rent_eco_pct = rent_eco_ratio !== null ? rent_eco_ratio * 100 : null

  const rentabilite_economique: RatioDetail = {
    valeur: rent_eco_pct,
    formule: '(EBE / (Actif immobilisé + BFR)) × 100',
    variables: { ebe, actif_immobilise, bfr },
    calcul:
      cap_investis === 0
        ? 'Division par 0 impossible'
        : `(${fmt(ebe)} / (${fmt(actif_immobilise)} + ${fmt(bfr)})) × 100 = (${fmt(ebe)} / ${fmt(cap_investis)}) × 100 = ${fmt(rent_eco_pct)}`,
    unite: '%',
  }

  // Taux de VA
  const taux_va_ratio =
    chiffre_affaires && chiffre_affaires !== 0 ? (va ?? 0) / chiffre_affaires : null
  const taux_va_pct = taux_va_ratio !== null ? taux_va_ratio * 100 : null

  const taux_va: RatioDetail = {
    valeur: taux_va_pct,
    formule: '(VA / CA) × 100',
    variables: { va, chiffre_affaires },
    calcul:
      chiffre_affaires === 0 || chiffre_affaires === null
        ? 'Division par 0 impossible'
        : `(${fmt(va)} / ${fmt(chiffre_affaires)}) × 100 = ${fmt(taux_va_pct)}`,
    unite: '%',
  }

  // Taux d'EBE
  const taux_ebe_ratio =
    chiffre_affaires && chiffre_affaires !== 0 ? (ebe ?? 0) / chiffre_affaires : null
  const taux_ebe_pct = taux_ebe_ratio !== null ? taux_ebe_ratio * 100 : null

  const taux_ebe: RatioDetail = {
    valeur: taux_ebe_pct,
    formule: '(EBE / CA) × 100',
    variables: { ebe, chiffre_affaires },
    calcul:
      chiffre_affaires === 0 || chiffre_affaires === null
        ? 'Division par 0 impossible'
        : `(${fmt(ebe)} / ${fmt(chiffre_affaires)}) × 100 = ${fmt(taux_ebe_pct)}`,
    unite: '%',
  }

  // Taux de marge brute
  const taux_mb_ratio = va && va !== 0 ? (ebe ?? 0) / va : null
  const taux_mb_pct = taux_mb_ratio !== null ? taux_mb_ratio * 100 : null

  const taux_marge_brute: RatioDetail = {
    valeur: taux_mb_pct,
    formule: '(EBE / VA) × 100',
    variables: { ebe, va },
    calcul:
      va === 0 || va === null
        ? 'Division par 0 impossible'
        : `(${fmt(ebe)} / ${fmt(va)}) × 100 = ${fmt(taux_mb_pct)}`,
    unite: '%',
  }

  // Taux de marge industrielle
  const marge_ind =
    (production ?? 0) - (achats_matieres_premieres ?? 0) - (autres_charges_externes ?? 0)
  const taux_mi_ratio = production && production !== 0 ? marge_ind / production : null
  const taux_mi_pct = taux_mi_ratio !== null ? taux_mi_ratio * 100 : null

  const taux_marge_industrielle: RatioDetail = {
    valeur: taux_mi_pct,
    formule: '(Production - Achats MP - Charges ext) / Production × 100',
    variables: { production, achats_matieres_premieres, autres_charges_externes },
    calcul:
      production === 0 || production === null
        ? 'Division par 0 impossible'
        : `(${fmt(production)} - ${fmt(achats_matieres_premieres)} - ${fmt(autres_charges_externes)}) / ${fmt(production)} × 100 = ${fmt(marge_ind)} / ${fmt(production)} × 100 = ${fmt(taux_mi_pct)}`,
    unite: '%',
  }

  // Taux de marge commerciale
  const taux_mc_ratio =
    ventes_marchandises && ventes_marchandises !== 0
      ? (marge_commerciale ?? 0) / ventes_marchandises
      : null
  const taux_mc_pct = taux_mc_ratio !== null ? taux_mc_ratio * 100 : null

  const taux_marge_commerciale: RatioDetail = {
    valeur: taux_mc_pct,
    formule: '(Marge commerciale / Ventes marchandises) × 100',
    variables: { marge_commerciale, ventes_marchandises },
    calcul:
      ventes_marchandises === 0 || ventes_marchandises === null
        ? 'Non applicable (pas de ventes de marchandises)'
        : `(${fmt(marge_commerciale)} / ${fmt(ventes_marchandises)}) × 100 = ${fmt(taux_mc_pct)}`,
    unite: '%',
  }

  // Rentabilité commerciale
  const rent_com_ratio =
    chiffre_affaires && chiffre_affaires !== 0 ? (resultat_net ?? 0) / chiffre_affaires : null
  const rent_com_pct = rent_com_ratio !== null ? rent_com_ratio * 100 : null

  const rentabilite_commerciale: RatioDetail = {
    valeur: rent_com_pct,
    formule: '(Résultat net / CA) × 100',
    variables: { resultat_net, chiffre_affaires },
    calcul:
      chiffre_affaires === 0 || chiffre_affaires === null
        ? 'Division par 0 impossible'
        : `(${fmt(resultat_net)} / ${fmt(chiffre_affaires)}) × 100 = ${fmt(rent_com_pct)}`,
    unite: '%',
  }

  // Charges de personnel / VA
  const cp_va_ratio = va && va !== 0 ? (charges_personnel ?? 0) / va : null
  const cp_va_pct = cp_va_ratio !== null ? cp_va_ratio * 100 : null

  const charges_personnel_va: RatioDetail = {
    valeur: cp_va_pct,
    formule: '(Charges de personnel / VA) × 100',
    variables: { charges_personnel, va },
    calcul:
      va === 0 || va === null
        ? 'Division par 0 impossible'
        : `(${fmt(charges_personnel)} / ${fmt(va)}) × 100 = ${fmt(cp_va_pct)}`,
    unite: '%',
  }

  // Charges financières / VA
  const cf_va_ratio = va && va !== 0 ? (charges_financieres ?? 0) / va : null
  const cf_va_pct = cf_va_ratio !== null ? cf_va_ratio * 100 : null

  const charges_financieres_va: RatioDetail = {
    valeur: cf_va_pct,
    formule: '(Charges financières / VA) × 100',
    variables: { charges_financieres, va },
    calcul:
      va === 0 || va === null
        ? 'Division par 0 impossible'
        : `(${fmt(charges_financieres)} / ${fmt(va)}) × 100 = ${fmt(cf_va_pct)}`,
    unite: '%',
  }

  // Impôts et taxes / VA
  const it_va_ratio = va && va !== 0 ? (impots_taxes ?? 0) / va : null
  const it_va_pct = it_va_ratio !== null ? it_va_ratio * 100 : null

  const impots_taxes_va: RatioDetail = {
    valeur: it_va_pct,
    formule: '(Impôts et taxes / VA) × 100',
    variables: { impots_taxes, va },
    calcul:
      va === 0 || va === null
        ? 'Division par 0 impossible'
        : `(${fmt(impots_taxes)} / ${fmt(va)}) × 100 = ${fmt(it_va_pct)}`,
    unite: '%',
  }

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
 * Calcule les ratios de solvabilité avec détails
 */
function calculateSolvabiliteDetails(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates
): CalculationDetails['ratios']['solvabilite'] {
  const { dettes_financieres, capitaux_propres, actif_immobilise, decouvert_bancaire } = donnees
  const { total_passif, bfr, caf, capitaux_permanents } = intermediates

  // Capacité de remboursement
  const cap_remb =
    caf && caf > 0 && dettes_financieres !== null ? (dettes_financieres / caf) * 360 : null

  const capacite_remboursement: RatioDetail = {
    valeur: cap_remb,
    formule: '(Dettes financières / CAF) × 360 jours',
    variables: { dettes_financieres, caf },
    calcul:
      caf === null || caf <= 0
        ? 'CAF négative ou nulle - ratio non significatif'
        : `(${fmt(dettes_financieres)} / ${fmt(caf)}) × 360 = ${fmt(cap_remb)}`,
    unite: 'jours',
  }

  // Taux d'endettement
  const taux_end_ratio =
    capitaux_propres && capitaux_propres !== 0 ? (dettes_financieres ?? 0) / capitaux_propres : null
  const taux_end_pct = taux_end_ratio !== null ? taux_end_ratio * 100 : null

  const taux_endettement: RatioDetail = {
    valeur: taux_end_pct,
    formule: '(Dettes financières / Capitaux propres) × 100',
    variables: { dettes_financieres, capitaux_propres },
    calcul:
      capitaux_propres === 0 || capitaux_propres === null
        ? 'Division par 0 impossible'
        : `(${fmt(dettes_financieres)} / ${fmt(capitaux_propres)}) × 100 = ${fmt(taux_end_pct)}`,
    unite: '%',
  }

  // Autonomie financière
  const auto_fin_ratio =
    total_passif && total_passif !== 0 ? (capitaux_propres ?? 0) / total_passif : null
  const auto_fin_pct = auto_fin_ratio !== null ? auto_fin_ratio * 100 : null

  const autonomie_financiere: RatioDetail = {
    valeur: auto_fin_pct,
    formule: '(Capitaux propres / Total passif) × 100',
    variables: { capitaux_propres, total_passif },
    calcul:
      total_passif === 0 || total_passif === null
        ? 'Division par 0 impossible'
        : `(${fmt(capitaux_propres)} / ${fmt(total_passif)}) × 100 = ${fmt(auto_fin_pct)}`,
    unite: '%',
  }

  // Équilibre financier global
  const emplois_stables = (actif_immobilise ?? 0) + (bfr ?? 0)
  const equi_ratio = emplois_stables !== 0 ? (capitaux_permanents ?? 0) / emplois_stables : null
  const equi_pct = equi_ratio !== null ? equi_ratio * 100 : null

  const equilibre_global: RatioDetail = {
    valeur: equi_pct,
    formule: '(Capitaux permanents / (Actif immobilisé + BFR)) × 100',
    variables: { capitaux_permanents, actif_immobilise, bfr },
    calcul:
      emplois_stables === 0
        ? 'Division par 0 impossible'
        : `(${fmt(capitaux_permanents)} / (${fmt(actif_immobilise)} + ${fmt(bfr)})) × 100 = (${fmt(capitaux_permanents)} / ${fmt(emplois_stables)}) × 100 = ${fmt(equi_pct)}`,
    unite: '%',
  }

  // Poids du découvert
  const poids_dec_ratio =
    dettes_financieres && dettes_financieres !== 0
      ? (decouvert_bancaire ?? 0) / dettes_financieres
      : null
  const poids_dec_pct = poids_dec_ratio !== null ? poids_dec_ratio * 100 : null

  const poids_decouvert: RatioDetail = {
    valeur: poids_dec_pct,
    formule: '(Découvert bancaire / Dettes financières) × 100',
    variables: { decouvert_bancaire, dettes_financieres },
    calcul:
      dettes_financieres === 0 || dettes_financieres === null
        ? 'Division par 0 impossible'
        : `(${fmt(decouvert_bancaire)} / ${fmt(dettes_financieres)}) × 100 = ${fmt(poids_dec_pct)}`,
    unite: '%',
  }

  return {
    capacite_remboursement,
    taux_endettement,
    autonomie_financiere,
    equilibre_global,
    poids_decouvert,
  }
}

/**
 * Calcule les ratios d'activité avec détails
 */
function calculateActiviteDetails(
  donnees: ExtractionValues,
  intermediates: IntermediateAggregates
): CalculationDetails['ratios']['activite'] {
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
  const { capitaux_permanents } = intermediates

  // Ratio de fonds de roulement
  const rfr_ratio =
    actif_immobilise && actif_immobilise !== 0
      ? (capitaux_permanents ?? 0) / actif_immobilise
      : null

  const ratio_fonds_roulement: RatioDetail = {
    valeur: rfr_ratio,
    formule: 'Capitaux permanents / Actif immobilisé',
    variables: { capitaux_permanents, actif_immobilise },
    calcul:
      actif_immobilise === 0 || actif_immobilise === null
        ? 'Division par 0 impossible'
        : `${fmt(capitaux_permanents)} / ${fmt(actif_immobilise)} = ${fmt(rfr_ratio)}`,
    unite: 'ratio',
  }

  // Délai fournisseurs
  const achats_ht =
    (achats_marchandises ?? 0) + (achats_matieres_premieres ?? 0) + (autres_charges_externes ?? 0)
  const achats_ttc = achats_ht * 1.2
  const delai_four = achats_ttc !== 0 ? ((dettes_fournisseurs ?? 0) * 360) / achats_ttc : null

  const delai_fournisseurs: RatioDetail = {
    valeur: delai_four,
    formule: '(Dettes fournisseurs × 360) / (Achats HT × 1.2)',
    variables: {
      dettes_fournisseurs,
      achats_marchandises,
      achats_matieres_premieres,
      autres_charges_externes,
    },
    calcul:
      achats_ttc === 0
        ? 'Division par 0 impossible'
        : `(${fmt(dettes_fournisseurs)} × 360) / (${fmt(achats_ht)} × 1.2) = ${fmt((dettes_fournisseurs ?? 0) * 360)} / ${fmt(achats_ttc)} = ${fmt(delai_four)}`,
    unite: 'jours',
  }

  // Délai clients
  const ca_ttc = (chiffre_affaires ?? 0) * 1.2
  const delai_cli = ca_ttc !== 0 ? ((creances_clients ?? 0) * 360) / ca_ttc : null

  const delai_clients: RatioDetail = {
    valeur: delai_cli,
    formule: '(Créances clients × 360) / (CA × 1.2)',
    variables: { creances_clients, chiffre_affaires },
    calcul:
      ca_ttc === 0
        ? 'Division par 0 impossible'
        : `(${fmt(creances_clients)} × 360) / (${fmt(chiffre_affaires)} × 1.2) = ${fmt((creances_clients ?? 0) * 360)} / ${fmt(ca_ttc)} = ${fmt(delai_cli)}`,
    unite: 'jours',
  }

  // Rotation des stocks
  const total_achats = (achats_marchandises ?? 0) + (achats_matieres_premieres ?? 0)
  const rot_stocks = total_achats !== 0 ? ((stocks ?? 0) * 360) / total_achats : null

  const rotation_stocks: RatioDetail = {
    valeur: rot_stocks,
    formule: '(Stocks × 360) / (Achats march. + Achats MP)',
    variables: { stocks, achats_marchandises, achats_matieres_premieres },
    calcul:
      total_achats === 0
        ? 'Division par 0 impossible'
        : `(${fmt(stocks)} × 360) / (${fmt(achats_marchandises)} + ${fmt(achats_matieres_premieres)}) = ${fmt((stocks ?? 0) * 360)} / ${fmt(total_achats)} = ${fmt(rot_stocks)}`,
    unite: 'jours',
  }

  return {
    ratio_fonds_roulement,
    delai_fournisseurs,
    delai_clients,
    rotation_stocks,
  }
}

/**
 * Fonction principale : calcule tous les ratios avec leurs détails
 */
export function calculateRatiosWithDetails(donnees: ExtractionValues): CalculationDetails {
  // Calcul des agrégats intermédiaires
  const intermediates = calculateIntermediates(donnees)

  // Calcul des détails pour chaque section
  const aggregats = calculateAggregatesWithDetails(donnees, intermediates)
  const liquidite = calculateLiquiditeDetails(donnees, intermediates)
  const rentabilite = calculateRentabiliteDetails(donnees, intermediates)
  const solvabilite = calculateSolvabiliteDetails(donnees, intermediates)
  const activite = calculateActiviteDetails(donnees, intermediates)

  return {
    donnees,
    aggregats,
    ratios: {
      liquidite,
      rentabilite,
      solvabilite,
      activite,
    },
  }
}
