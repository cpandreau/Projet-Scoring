/**
 * Configuration des champs d'extraction organisés par type de liasse
 * Défaillantomètre - Affichage différencié selon le type de liasse fiscale
 */

import type { TypeLiasse } from "@/types/document";

// Type pour un champ dans une section
export interface FieldConfig {
  key: string;
  label: string;
  case: string;
}

// Type pour une section de champs
export interface SectionConfig {
  title: string;
  fields: FieldConfig[];
}

// Type pour la configuration complète d'une liasse
export interface LiasseFieldsConfig {
  bilan_actif: SectionConfig;
  bilan_passif: SectionConfig;
  compte_resultat_produits: SectionConfig;
  compte_resultat_charges: SectionConfig;
  resultats: SectionConfig;
}

// ============================================================================
// LIASSE NORMALE (CERFA 2050-2059)
// ============================================================================

export const FIELDS_LIASSE_NORMALE: LiasseFieldsConfig = {
  bilan_actif: {
    title: "Bilan - Actif (2050)",
    fields: [
      { key: "actif_immobilise", label: "Actif immobilisé net", case: "BK" },
      { key: "stocks", label: "Stocks et en-cours", case: "BL+BN+BP+BR+BT" },
      { key: "creances_clients", label: "Créances clients", case: "BV+BX" },
      { key: "disponibilites", label: "Disponibilités", case: "CG+CH" },
      { key: "actif_circulant", label: "Actif circulant", case: "CJ-CR" },
    ],
  },
  bilan_passif: {
    title: "Bilan - Passif (2051)",
    fields: [
      { key: "capitaux_propres", label: "Capitaux propres", case: "DL" },
      { key: "provisions_risques_charges", label: "Provisions R&C", case: "DO+DP" },
      { key: "dettes_financieres", label: "Dettes financières", case: "DR+DS+DT" },
      { key: "dettes_fournisseurs", label: "Dettes fournisseurs", case: "DX" },
      { key: "dettes_fiscales_sociales", label: "Dettes fiscales et sociales", case: "DY" },
      { key: "comptes_courants_associes", label: "Comptes courants associés", case: "DW" },
      { key: "decouvert_bancaire", label: "Découvert bancaire", case: "EH" },
      { key: "total_passif", label: "Total passif", case: "EE" },
    ],
  },
  compte_resultat_produits: {
    title: "Compte de résultat - Produits (2052)",
    fields: [
      { key: "ventes_marchandises", label: "Ventes de marchandises", case: "FC" },
      { key: "production", label: "Production vendue", case: "FD+FE+FF" },
      { key: "chiffre_affaires", label: "Chiffre d'affaires", case: "FL" },
      { key: "subventions_exploitation", label: "Subventions d'exploitation", case: "FO" },
      { key: "reprises_provisions", label: "Reprises sur provisions", case: "FP" },
      { key: "variation_stocks", label: "Variation des stocks", case: "FM" },
    ],
  },
  compte_resultat_charges: {
    title: "Compte de résultat - Charges (2052-2053)",
    fields: [
      { key: "achats_marchandises", label: "Achats de marchandises", case: "FS" },
      { key: "achats_matieres_premieres", label: "Achats matières premières", case: "FU" },
      { key: "autres_charges_externes", label: "Autres charges externes", case: "FW" },
      { key: "impots_taxes", label: "Impôts et taxes", case: "FX" },
      { key: "charges_personnel", label: "Charges de personnel", case: "FY+FZ" },
      { key: "dotations_amortissements", label: "Dotations aux amortissements", case: "GA+GB+GC" },
      { key: "charges_financieres", label: "Charges financières", case: "GU" },
    ],
  },
  resultats: {
    title: "Résultats",
    fields: [
      { key: "resultat_exploitation", label: "Résultat d'exploitation", case: "GG" },
      { key: "resultat_net", label: "Résultat net", case: "HN" },
    ],
  },
};

// ============================================================================
// LIASSE SIMPLIFIÉE (CERFA 2033)
// ============================================================================

export const FIELDS_LIASSE_SIMPLIFIEE: LiasseFieldsConfig = {
  bilan_actif: {
    title: "Bilan - Actif (2033-A)",
    fields: [
      { key: "actif_immobilise", label: "Actif immobilisé net", case: "048" },
      { key: "stocks", label: "Stocks et en-cours", case: "050+052+054+056" },
      { key: "creances_clients", label: "Créances clients", case: "068+070" },
      { key: "disponibilites", label: "Disponibilités", case: "082+086" },
      { key: "actif_circulant", label: "Actif circulant", case: "096" },
    ],
  },
  bilan_passif: {
    title: "Bilan - Passif (2033-A)",
    fields: [
      { key: "capitaux_propres", label: "Capitaux propres", case: "142" },
      { key: "provisions_risques_charges", label: "Provisions R&C", case: "150" },
      { key: "dettes_financieres", label: "Dettes financières", case: "154+156+164" },
      { key: "dettes_fournisseurs", label: "Dettes fournisseurs", case: "166" },
      { key: "dettes_fiscales_sociales", label: "Dettes fiscales et sociales", case: "172-169" },
      { key: "comptes_courants_associes", label: "Comptes courants associés", case: "169" },
      { key: "decouvert_bancaire", label: "Découvert bancaire", case: "—" },
      { key: "total_passif", label: "Total passif", case: "180" },
    ],
  },
  compte_resultat_produits: {
    title: "Compte de résultat - Produits (2033-B)",
    fields: [
      { key: "ventes_marchandises", label: "Ventes de marchandises", case: "210" },
      { key: "production", label: "Production vendue", case: "214+218" },
      { key: "chiffre_affaires", label: "Chiffre d'affaires", case: "210+214+218" },
      { key: "subventions_exploitation", label: "Subventions d'exploitation", case: "226" },
      { key: "reprises_provisions", label: "Reprises sur provisions", case: "—" },
      { key: "variation_stocks", label: "Variation des stocks", case: "222" },
    ],
  },
  compte_resultat_charges: {
    title: "Compte de résultat - Charges (2033-B)",
    fields: [
      { key: "achats_marchandises", label: "Achats de marchandises", case: "234" },
      { key: "achats_matieres_premieres", label: "Achats matières premières", case: "238" },
      { key: "autres_charges_externes", label: "Autres charges externes", case: "242" },
      { key: "impots_taxes", label: "Impôts et taxes", case: "244" },
      { key: "charges_personnel", label: "Charges de personnel", case: "250+252" },
      { key: "dotations_amortissements", label: "Dotations aux amortissements", case: "254+256" },
      { key: "charges_financieres", label: "Charges financières", case: "294" },
    ],
  },
  resultats: {
    title: "Résultats",
    fields: [
      { key: "resultat_exploitation", label: "Résultat d'exploitation", case: "270" },
      { key: "resultat_net", label: "Résultat net", case: "310" },
    ],
  },
};

// ============================================================================
// FONCTION UTILITAIRE
// ============================================================================

/**
 * Récupère la configuration des champs selon le type de liasse
 * @param typeLiasse - Type de liasse ("normale" ou "simplifiee")
 * @returns Configuration des champs pour ce type de liasse
 */
export function getFieldsForLiasse(typeLiasse: TypeLiasse): LiasseFieldsConfig {
  return typeLiasse === "normale" ? FIELDS_LIASSE_NORMALE : FIELDS_LIASSE_SIMPLIFIEE;
}

/**
 * Récupère le label du type de liasse pour l'affichage
 * @param typeLiasse - Type de liasse
 * @returns Label formaté pour l'affichage
 */
export function getLiasseTypeLabel(typeLiasse: TypeLiasse): string {
  return typeLiasse === "normale"
    ? "Liasse normale (2050-2059)"
    : "Liasse simplifiée (2033)";
}
