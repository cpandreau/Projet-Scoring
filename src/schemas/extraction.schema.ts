import { z } from "zod";

// Type pour le type de liasse fiscale
export const typeLiasseSchema = z.enum(["normale", "simplifiee"]);
export type TypeLiasse = z.infer<typeof typeLiasseSchema>;

// Type pour une valeur avec sa source CERFA
export const valueWithSourceSchema = z.object({
  valeur: z.number().nullable(),
  case_source: z.string().nullable(), // Ex: "FL (2052)", "DL (2051)" ou "210+214 (simplifié)"
});

export type ValueWithSource = z.infer<typeof valueWithSourceSchema>;

// Schéma pour l'extraction des données financières avec sources
export const extractionSchema = z.object({
  // Métadonnées
  type_liasse: typeLiasseSchema.describe("Type de liasse fiscale identifié : 'normale' (CERFA 2050-2059) ou 'simplifiee' (CERFA 2033)"),

  // Compte de résultat
  chiffre_affaires: valueWithSourceSchema.describe("Chiffre d'affaires net (ventes de marchandises + production vendue)"),
  achats_marchandises: valueWithSourceSchema.describe("Achats de marchandises"),
  achats_matieres_premieres: valueWithSourceSchema.describe("Achats de matières premières et autres approvisionnements"),
  autres_charges_externes: valueWithSourceSchema.describe("Autres achats et charges externes"),
  impots_taxes: valueWithSourceSchema.describe("Impôts, taxes et versements assimilés"),
  charges_personnel: valueWithSourceSchema.describe("Charges de personnel (salaires + charges sociales)"),
  charges_financieres: valueWithSourceSchema.describe("Charges financières"),
  resultat_exploitation: valueWithSourceSchema.describe("Résultat d'exploitation"),
  resultat_net: valueWithSourceSchema.describe("Résultat net de l'exercice"),

  // Bilan - Actif
  actif_immobilise: valueWithSourceSchema.describe("Total actif immobilisé (immobilisations incorporelles + corporelles + financières)"),
  actif_circulant: valueWithSourceSchema.describe("Total actif circulant (stocks + créances + disponibilités)"),
  stocks: valueWithSourceSchema.describe("Total des stocks (marchandises + matières premières + en-cours + produits finis)"),
  creances_clients: valueWithSourceSchema.describe("Créances clients et comptes rattachés"),
  disponibilites: valueWithSourceSchema.describe("Disponibilités (caisse + banque)"),

  // Bilan - Passif
  capitaux_propres: valueWithSourceSchema.describe("Total capitaux propres"),
  total_passif: valueWithSourceSchema.describe("Total du passif (égal au total actif)"),
  dettes_financieres: valueWithSourceSchema.describe("Dettes financières (emprunts + dettes bancaires)"),
  dettes_fournisseurs: valueWithSourceSchema.describe("Dettes fournisseurs et comptes rattachés"),
  decouvert_bancaire: valueWithSourceSchema.describe("Concours bancaires courants et soldes créditeurs de banque"),

  // Détails compte de résultat
  ventes_marchandises: valueWithSourceSchema.describe("Ventes de marchandises uniquement"),
  production: valueWithSourceSchema.describe("Production vendue + stockée + immobilisée"),

  // Champs complémentaires pour calculs avancés (CAF, BFR précis, etc.)
  subventions_exploitation: valueWithSourceSchema.describe("Subventions d'exploitation reçues"),
  dettes_fiscales_sociales: valueWithSourceSchema.describe("Dettes fiscales et sociales (personnel, organismes sociaux, État)"),
  comptes_courants_associes: valueWithSourceSchema.describe("Comptes courants créditeurs d'associés"),
  provisions_risques_charges: valueWithSourceSchema.describe("Provisions pour risques et charges"),
  dotations_amortissements: valueWithSourceSchema.describe("Dotations aux amortissements et provisions d'exploitation"),
  reprises_provisions: valueWithSourceSchema.describe("Reprises sur provisions d'exploitation"),
  variation_stocks: valueWithSourceSchema.describe("Variation des stocks (production stockée)"),
});

export type ExtractionData = z.infer<typeof extractionSchema>;

// Champs numériques (tous sauf type_liasse)
export type NumericExtractionField = Exclude<keyof ExtractionData, "type_liasse">;

// Type pour les valeurs numériques simples (utilisé pour les calculs)
export type ExtractionValues = {
  [K in NumericExtractionField]: number | null;
};

// Helper pour extraire uniquement les valeurs numériques
export function extractValues(data: ExtractionData): ExtractionValues {
  const result = {} as ExtractionValues;
  for (const key of Object.keys(data) as (keyof ExtractionData)[]) {
    // Ignorer type_liasse qui n'est pas un champ numérique
    if (key === "type_liasse") continue;

    const field = data[key as NumericExtractionField];
    // Gère les cas où le champ n'a pas la structure attendue (ValueWithSource)
    if (field && typeof field === "object" && "valeur" in field) {
      result[key as NumericExtractionField] = field.valeur ?? null;
    } else if (typeof field === "number") {
      // Compatibilité avec ancien format (nombre direct)
      result[key as NumericExtractionField] = field;
    } else {
      result[key as NumericExtractionField] = null;
    }
  }
  return result;
}

// Liste des champs de l'extraction
export const EXTRACTION_FIELDS = Object.keys(extractionSchema.shape) as (keyof ExtractionData)[];

// Labels pour l'affichage
export const EXTRACTION_FIELD_LABELS: Record<keyof ExtractionData, string> = {
  type_liasse: "Type de liasse",
  chiffre_affaires: "Chiffre d'affaires",
  achats_marchandises: "Achats de marchandises",
  achats_matieres_premieres: "Achats de matières premières",
  autres_charges_externes: "Autres charges externes",
  impots_taxes: "Impôts et taxes",
  charges_personnel: "Charges de personnel",
  charges_financieres: "Charges financières",
  resultat_exploitation: "Résultat d'exploitation",
  resultat_net: "Résultat net",
  actif_immobilise: "Actif immobilisé",
  actif_circulant: "Actif circulant",
  stocks: "Stocks",
  creances_clients: "Créances clients",
  disponibilites: "Disponibilités",
  capitaux_propres: "Capitaux propres",
  total_passif: "Total passif",
  dettes_financieres: "Dettes financières",
  dettes_fournisseurs: "Dettes fournisseurs",
  decouvert_bancaire: "Découvert bancaire",
  ventes_marchandises: "Ventes de marchandises",
  production: "Production",
  subventions_exploitation: "Subventions d'exploitation",
  dettes_fiscales_sociales: "Dettes fiscales et sociales",
  comptes_courants_associes: "Comptes courants d'associés",
  provisions_risques_charges: "Provisions pour risques et charges",
  dotations_amortissements: "Dotations aux amortissements",
  reprises_provisions: "Reprises sur provisions",
  variation_stocks: "Variation des stocks",
};

// Catégories pour l'affichage groupé
export const EXTRACTION_CATEGORIES = {
  compte_resultat: {
    label: "Compte de résultat",
    fields: [
      "chiffre_affaires",
      "ventes_marchandises",
      "production",
      "achats_marchandises",
      "achats_matieres_premieres",
      "autres_charges_externes",
      "impots_taxes",
      "charges_personnel",
      "charges_financieres",
      "resultat_exploitation",
      "resultat_net",
    ] as const,
  },
  actif: {
    label: "Bilan - Actif",
    fields: [
      "actif_immobilise",
      "actif_circulant",
      "stocks",
      "creances_clients",
      "disponibilites",
    ] as const,
  },
  passif: {
    label: "Bilan - Passif",
    fields: [
      "capitaux_propres",
      "total_passif",
      "dettes_financieres",
      "dettes_fournisseurs",
      "decouvert_bancaire",
      "comptes_courants_associes",
    ] as const,
  },
} as const;
