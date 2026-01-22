import type { NumericExtractionField } from "@/schemas/extraction.schema";

// Configuration des labels français pour les champs d'extraction
// Organisés par sections pour l'interface de validation

export interface FieldConfig {
  key: NumericExtractionField;
  label: string;
}

export interface SectionConfig {
  id: string;
  title: string;
  fields: FieldConfig[];
}

// Labels français pour chaque champ
export const FIELD_LABELS: Record<NumericExtractionField, string> = {
  // Bilan - Actif
  actif_immobilise: "Actif immobilisé net",
  stocks: "Stocks et en-cours",
  creances_clients: "Créances clients",
  disponibilites: "Disponibilités",
  actif_circulant: "Actif circulant",

  // Bilan - Passif
  capitaux_propres: "Capitaux propres",
  dettes_financieres: "Dettes financières",
  dettes_fournisseurs: "Dettes fournisseurs",
  decouvert_bancaire: "Découvert bancaire",
  total_passif: "Total passif",
  dettes_fiscales_sociales: "Dettes fiscales et sociales",
  comptes_courants_associes: "Comptes courants d'associés",
  provisions_risques_charges: "Provisions pour risques et charges",

  // Compte de résultat - Produits
  chiffre_affaires: "Chiffre d'affaires net",
  ventes_marchandises: "Ventes de marchandises",
  production: "Production",
  subventions_exploitation: "Subventions d'exploitation",
  reprises_provisions: "Reprises sur provisions",
  variation_stocks: "Variation des stocks",

  // Compte de résultat - Charges
  achats_marchandises: "Achats de marchandises",
  achats_matieres_premieres: "Achats matières premières",
  autres_charges_externes: "Autres charges externes",
  impots_taxes: "Impôts et taxes",
  charges_personnel: "Charges de personnel",
  charges_financieres: "Charges financières",
  dotations_amortissements: "Dotations amortissements et provisions",

  // Résultats
  resultat_exploitation: "Résultat d'exploitation",
  resultat_net: "Résultat net",
};

// Organisation par sections pour l'affichage
export const EXTRACTION_SECTIONS: SectionConfig[] = [
  {
    id: "actif",
    title: "BILAN - ACTIF",
    fields: [
      { key: "actif_immobilise", label: FIELD_LABELS.actif_immobilise },
      { key: "stocks", label: FIELD_LABELS.stocks },
      { key: "creances_clients", label: FIELD_LABELS.creances_clients },
      { key: "disponibilites", label: FIELD_LABELS.disponibilites },
      { key: "actif_circulant", label: FIELD_LABELS.actif_circulant },
    ],
  },
  {
    id: "passif",
    title: "BILAN - PASSIF",
    fields: [
      { key: "capitaux_propres", label: FIELD_LABELS.capitaux_propres },
      { key: "dettes_financieres", label: FIELD_LABELS.dettes_financieres },
      { key: "dettes_fournisseurs", label: FIELD_LABELS.dettes_fournisseurs },
      { key: "dettes_fiscales_sociales", label: FIELD_LABELS.dettes_fiscales_sociales },
      { key: "comptes_courants_associes", label: FIELD_LABELS.comptes_courants_associes },
      { key: "provisions_risques_charges", label: FIELD_LABELS.provisions_risques_charges },
      { key: "decouvert_bancaire", label: FIELD_LABELS.decouvert_bancaire },
      { key: "total_passif", label: FIELD_LABELS.total_passif },
    ],
  },
  {
    id: "produits",
    title: "COMPTE DE RÉSULTAT - PRODUITS",
    fields: [
      { key: "chiffre_affaires", label: FIELD_LABELS.chiffre_affaires },
      { key: "ventes_marchandises", label: FIELD_LABELS.ventes_marchandises },
      { key: "production", label: FIELD_LABELS.production },
      { key: "subventions_exploitation", label: FIELD_LABELS.subventions_exploitation },
      { key: "reprises_provisions", label: FIELD_LABELS.reprises_provisions },
      { key: "variation_stocks", label: FIELD_LABELS.variation_stocks },
    ],
  },
  {
    id: "charges",
    title: "COMPTE DE RÉSULTAT - CHARGES",
    fields: [
      { key: "achats_marchandises", label: FIELD_LABELS.achats_marchandises },
      { key: "achats_matieres_premieres", label: FIELD_LABELS.achats_matieres_premieres },
      { key: "autres_charges_externes", label: FIELD_LABELS.autres_charges_externes },
      { key: "impots_taxes", label: FIELD_LABELS.impots_taxes },
      { key: "charges_personnel", label: FIELD_LABELS.charges_personnel },
      { key: "charges_financieres", label: FIELD_LABELS.charges_financieres },
      { key: "dotations_amortissements", label: FIELD_LABELS.dotations_amortissements },
    ],
  },
  {
    id: "resultats",
    title: "RÉSULTATS",
    fields: [
      { key: "resultat_exploitation", label: FIELD_LABELS.resultat_exploitation },
      { key: "resultat_net", label: FIELD_LABELS.resultat_net },
    ],
  },
];

// Helper pour obtenir le label d'un champ
export function getFieldLabel(key: NumericExtractionField): string {
  return FIELD_LABELS[key] || key;
}

// Helper pour formater une valeur monétaire
export function formatCurrency(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Helper pour formater la source CERFA
export function formatCaseSource(caseSource: string | null): string {
  if (!caseSource) return "";
  return `(${caseSource})`;
}
