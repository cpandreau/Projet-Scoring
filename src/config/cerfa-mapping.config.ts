/**
 * Configuration des mappings entre champs comptables et cases CERFA
 * Défaillantomètre - Extraction des données de liasses fiscales
 *
 * Sources :
 * - Liasse normale : CERFA 2050 à 2059
 * - Liasse simplifiée : CERFA 2033-A à 2033-G
 */

// Types de formulaires
export type FormType = "normal" | "simplified";

// Sources des formulaires liasse normale
export type NormalFormSource =
  | "2050" // Bilan Actif
  | "2051" // Bilan Passif
  | "2052" // Compte de résultat (charges)
  | "2053" // Compte de résultat (produits)
  | "2054" // Immobilisations
  | "2055" // Amortissements
  | "2056" // Provisions
  | "2057" // État des échéances
  | "2058-A" // Détermination du résultat fiscal
  | "2058-B" // Déficits, indemnités pour congés à payer
  | "2058-C" // Tableau d'affectation du résultat
  | "2059-A" // Détermination des plus et moins-values
  | "2059-B" // Affectation des plus-values
  | "2059-C" // Suivi des moins-values
  | "2059-D" // Réserve spéciale des plus-values
  | "2059-E" // Détermination de la valeur ajoutée
  | "2059-F" // Composition du capital social
  | "2059-G"; // Filiales et participations

// Sources des formulaires liasse simplifiée
export type SimplifiedFormSource =
  | "2033-A" // Bilan simplifié
  | "2033-B" // Compte de résultat simplifié
  | "2033-C" // Immobilisations, amortissements, plus-values
  | "2033-D" // Relevé des provisions
  | "2033-E" // Détermination de la valeur ajoutée
  | "2033-F" // Composition du capital social
  | "2033-G"; // Filiales et participations

// Définition d'un mapping de case
export interface CaseMapping {
  /** Identifiant unique du champ */
  id: string;
  /** Nom du champ en français */
  nom: string;
  /** Description comptable détaillée */
  description: string;
  /** Catégorie du champ */
  categorie: "actif" | "passif" | "resultat" | "complementaire" | "sig";
  /** Mapping pour la liasse normale */
  normal: {
    /** Formulaire source (2050, 2051, etc.) */
    formulaire: NormalFormSource;
    /** Cases à utiliser avec formule */
    cases: string;
    /** Formule de calcul si plusieurs cases */
    formule?: string;
    /** Colonne à utiliser (1=brut, 2=amort/prov, 3=net pour actif) */
    colonne?: 1 | 2 | 3;
  };
  /** Mapping pour la liasse simplifiée */
  simplified: {
    /** Formulaire source (2033-A, 2033-B, etc.) */
    formulaire: SimplifiedFormSource;
    /** Cases à utiliser */
    cases: string;
    /** Formule de calcul si plusieurs cases */
    formule?: string;
    /** Colonne à utiliser */
    colonne?: 1 | 2;
  };
  /** Unité de la valeur */
  unite: "euros" | "pourcentage" | "jours";
  /** Signe attendu (positif, négatif, ou les deux) */
  signe?: "positif" | "negatif" | "mixte";
}

// ============================================================================
// MAPPINGS DES CASES CERFA
// ============================================================================

export const CERFA_MAPPINGS: Record<string, CaseMapping> = {
  // ---------------------------------------------------------------------------
  // BILAN ACTIF (2050 / 2033-A)
  // ---------------------------------------------------------------------------

  actif_immobilise: {
    id: "actif_immobilise",
    nom: "Actif immobilisé",
    description:
      "Total de l'actif immobilisé net (immobilisations incorporelles, corporelles et financières)",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "BK",
      colonne: 3, // Colonne Net
    },
    simplified: {
      formulaire: "2033-A",
      cases: "048",
      colonne: 2, // Colonne Net
    },
    unite: "euros",
    signe: "positif",
  },

  immobilisations_incorporelles: {
    id: "immobilisations_incorporelles",
    nom: "Immobilisations incorporelles",
    description: "Frais d'établissement, recherche, concessions, brevets, fonds commercial",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "AF+AH+AJ+AL+AN",
      formule: "AF + AH + AJ + AL + AN (colonne net)",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "010+014+016",
      formule: "010 + 014 + 016 (colonne net)",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  immobilisations_corporelles: {
    id: "immobilisations_corporelles",
    nom: "Immobilisations corporelles",
    description: "Terrains, constructions, installations, matériel, autres immobilisations",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "AP+AR+AT+AV+AX",
      formule: "AP + AR + AT + AV + AX (colonne net)",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "028+030+032+036+040",
      formule: "028 + 030 + 032 + 036 + 040 (colonne net)",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  immobilisations_financieres: {
    id: "immobilisations_financieres",
    nom: "Immobilisations financières",
    description: "Participations, créances rattachées, autres titres, prêts",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "AZ+BB+BD+BF+BH",
      formule: "AZ + BB + BD + BF + BH (colonne net)",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "044+046",
      formule: "044 + 046 (colonne net)",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  stocks: {
    id: "stocks",
    nom: "Stocks et en-cours",
    description:
      "Matières premières, en-cours de production, produits finis, marchandises",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "BL+BN+BP+BR+BT",
      formule: "BL + BN + BP + BR + BT (colonne net)",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "050+052+054+056",
      formule: "050 + 052 + 054 + 056 (colonne net)",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  stocks_matieres_premieres: {
    id: "stocks_matieres_premieres",
    nom: "Stocks matières premières",
    description: "Matières premières et autres approvisionnements",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "BL",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "050",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  stocks_marchandises: {
    id: "stocks_marchandises",
    nom: "Stocks marchandises",
    description: "Marchandises destinées à la revente",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "BT",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "056",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  creances_clients: {
    id: "creances_clients",
    nom: "Créances clients",
    description:
      "Avances et acomptes versés, créances clients et comptes rattachés (net de provisions)",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "BV+BX",
      formule: "BV + BX (colonne net) - provisions éventuelles (case 416)",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "068+070",
      formule: "068 + 070 (colonne net)",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  autres_creances: {
    id: "autres_creances",
    nom: "Autres créances",
    description: "Autres créances (personnel, État, etc.)",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "BZ",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "072",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  valeurs_mobilieres_placement: {
    id: "valeurs_mobilieres_placement",
    nom: "Valeurs mobilières de placement",
    description: "Actions propres, autres titres de placement",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "CD+CF",
      formule: "CD + CF (colonne net)",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "080",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  disponibilites: {
    id: "disponibilites",
    nom: "Disponibilités",
    description: "Caisse, banques, CCP et instruments de trésorerie",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "CG+CH",
      formule: "CG (disponibilités) + CH (instruments de trésorerie)",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "082+086",
      formule: "082 (disponibilités) + 086 (instruments de trésorerie)",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  charges_constatees_avance: {
    id: "charges_constatees_avance",
    nom: "Charges constatées d'avance",
    description: "Charges payées d'avance",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "CK",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "092",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  actif_circulant: {
    id: "actif_circulant",
    nom: "Actif circulant",
    description:
      "Total de l'actif circulant (stocks, créances, disponibilités) hors charges constatées d'avance",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "CJ-CR",
      formule: "CJ (total II actif circulant brut) - CR (amort. et prov. actif circulant)",
      colonne: 3,
    },
    simplified: {
      formulaire: "2033-A",
      cases: "096",
      formule: "Somme des lignes 050 à 092 (colonne net)",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  total_actif: {
    id: "total_actif",
    nom: "Total actif",
    description: "Total général de l'actif",
    categorie: "actif",
    normal: {
      formulaire: "2050",
      cases: "CO",
      colonne: 3, // Colonne Net
    },
    simplified: {
      formulaire: "2033-A",
      cases: "110",
      colonne: 2,
    },
    unite: "euros",
    signe: "positif",
  },

  // ---------------------------------------------------------------------------
  // BILAN PASSIF (2051 / 2033-A)
  // ---------------------------------------------------------------------------

  capital_social: {
    id: "capital_social",
    nom: "Capital social ou individuel",
    description: "Capital souscrit (appelé ou non appelé)",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DA",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "120",
    },
    unite: "euros",
    signe: "positif",
  },

  primes_emission: {
    id: "primes_emission",
    nom: "Primes d'émission, de fusion, d'apport",
    description: "Primes liées au capital social",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DB",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "122",
    },
    unite: "euros",
    signe: "positif",
  },

  reserves: {
    id: "reserves",
    nom: "Réserves",
    description: "Réserve légale, statutaires, réglementées et autres",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DC+DD+DE+DF",
      formule: "DC + DD + DE + DF (réserves diverses)",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "124+126",
      formule: "124 + 126 (réserves)",
    },
    unite: "euros",
    signe: "positif",
  },

  report_a_nouveau: {
    id: "report_a_nouveau",
    nom: "Report à nouveau",
    description: "Bénéfices ou pertes reportés des exercices antérieurs",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DG",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "128",
    },
    unite: "euros",
    signe: "mixte",
  },

  resultat_exercice: {
    id: "resultat_exercice",
    nom: "Résultat de l'exercice",
    description: "Bénéfice ou perte de l'exercice",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DI",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "134",
    },
    unite: "euros",
    signe: "mixte",
  },

  subventions_investissement: {
    id: "subventions_investissement",
    nom: "Subventions d'investissement",
    description: "Subventions reçues pour financer des immobilisations",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DJ",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "136",
    },
    unite: "euros",
    signe: "positif",
  },

  provisions_reglementees: {
    id: "provisions_reglementees",
    nom: "Provisions réglementées",
    description: "Provisions pour amortissements dérogatoires, etc.",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DK",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "140",
    },
    unite: "euros",
    signe: "positif",
  },

  capitaux_propres: {
    id: "capitaux_propres",
    nom: "Capitaux propres",
    description:
      "Total des capitaux propres (capital, réserves, résultat, subventions, provisions réglementées)",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DL",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "142",
    },
    unite: "euros",
    signe: "mixte",
  },

  provisions_risques_charges: {
    id: "provisions_risques_charges",
    nom: "Provisions pour risques et charges",
    description: "Provisions pour risques, pour charges",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DO+DP",
      formule: "DO + DP (provisions risques + charges)",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "150",
    },
    unite: "euros",
    signe: "positif",
  },

  emprunts_etablissements_credit: {
    id: "emprunts_etablissements_credit",
    nom: "Emprunts auprès des établissements de crédit",
    description: "Emprunts bancaires et dettes auprès des établissements de crédit",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DS",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "156",
    },
    unite: "euros",
    signe: "positif",
  },

  emprunts_obligataires: {
    id: "emprunts_obligataires",
    nom: "Emprunts obligataires convertibles",
    description: "Emprunts obligataires",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DR",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "154",
    },
    unite: "euros",
    signe: "positif",
  },

  dettes_financieres: {
    id: "dettes_financieres",
    nom: "Dettes financières",
    description:
      "Total des emprunts et dettes financières (hors découverts bancaires)",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DR+DS+DT",
      formule: "DR + DS + DT (emprunts et dettes assimilées)",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "154+156+164",
      formule: "154 + 156 + 164 (emprunts)",
    },
    unite: "euros",
    signe: "positif",
  },

  avances_acomptes_recus: {
    id: "avances_acomptes_recus",
    nom: "Avances et acomptes reçus",
    description: "Avances et acomptes reçus sur commandes en cours",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DW",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "168",
    },
    unite: "euros",
    signe: "positif",
  },

  dettes_fournisseurs: {
    id: "dettes_fournisseurs",
    nom: "Dettes fournisseurs",
    description: "Dettes fournisseurs et comptes rattachés",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DX",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "166",
    },
    unite: "euros",
    signe: "positif",
  },

  dettes_fiscales_sociales: {
    id: "dettes_fiscales_sociales",
    nom: "Dettes fiscales et sociales",
    description: "Dettes fiscales, dettes sociales (personnel, organismes sociaux). En liasse simplifiée : case 172 (autres dettes) moins case 169 (comptes courants associés)",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DY",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "172-169",
      formule: "172 - 169 (autres dettes moins comptes courants associés)",
    },
    unite: "euros",
    signe: "positif",
  },

  comptes_courants_associes: {
    id: "comptes_courants_associes",
    nom: "Comptes courants d'associés",
    description: "Comptes courants créditeurs d'associés. En liasse simplifiée : case 169 (dont comptes courants dans autres dettes)",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DW",
      formule: "DW (partie comptes courants des dettes diverses)",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "169",
      formule: "169 (dont comptes courants d'associés)",
    },
    unite: "euros",
    signe: "positif",
  },

  autres_dettes: {
    id: "autres_dettes",
    nom: "Autres dettes",
    description: "Dettes sur immobilisations, autres dettes diverses",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "DZ+EA",
      formule: "DZ + EA (autres dettes)",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "172+174",
      formule: "172 + 174 (autres dettes)",
    },
    unite: "euros",
    signe: "positif",
  },

  produits_constates_avance: {
    id: "produits_constates_avance",
    nom: "Produits constatés d'avance",
    description: "Produits encaissés d'avance",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "EB",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "176",
    },
    unite: "euros",
    signe: "positif",
  },

  decouvert_bancaire: {
    id: "decouvert_bancaire",
    nom: "Découverts bancaires",
    description: "Concours bancaires courants et soldes créditeurs de banques. ATTENTION : Non isolable en liasse simplifiée (inclus dans emprunts case 156)",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "EH",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "NULL",
      formule: "Non isolable en liasse simplifiée - inclus dans emprunts (case 156)",
    },
    unite: "euros",
    signe: "positif",
  },

  total_passif: {
    id: "total_passif",
    nom: "Total passif",
    description: "Total général du passif",
    categorie: "passif",
    normal: {
      formulaire: "2051",
      cases: "EE",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "180",
    },
    unite: "euros",
    signe: "positif",
  },

  // ---------------------------------------------------------------------------
  // COMPTE DE RÉSULTAT - PRODUITS (2052 / 2033-B)
  // ---------------------------------------------------------------------------

  ventes_marchandises: {
    id: "ventes_marchandises",
    nom: "Ventes de marchandises",
    description: "Chiffre d'affaires net des ventes de marchandises",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FC",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "210",
    },
    unite: "euros",
    signe: "positif",
  },

  production_vendue_biens: {
    id: "production_vendue_biens",
    nom: "Production vendue de biens",
    description: "Ventes de produits fabriqués, travaux",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FD+FE",
      formule: "FD + FE (production vendue)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "214",
    },
    unite: "euros",
    signe: "positif",
  },

  production_vendue_services: {
    id: "production_vendue_services",
    nom: "Production vendue de services",
    description: "Prestations de services",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FF",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "218",
    },
    unite: "euros",
    signe: "positif",
  },

  chiffre_affaires: {
    id: "chiffre_affaires",
    nom: "Chiffre d'affaires net",
    description: "Total du chiffre d'affaires HT (ventes + production vendue)",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FL",
      formule: "FL = FC + FD + FE + FF (chiffre d'affaires net total)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "210+214+218",
      formule: "210 + 214 + 218",
    },
    unite: "euros",
    signe: "positif",
  },

  production_stockee: {
    id: "production_stockee",
    nom: "Production stockée",
    description: "Variation de la production stockée (+ ou -)",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FM",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "222",
    },
    unite: "euros",
    signe: "mixte",
  },

  // Alias pour le schéma d'extraction (variation_stocks = production_stockee)
  variation_stocks: {
    id: "variation_stocks",
    nom: "Variation des stocks",
    description: "Variation de la production stockée (+ ou -)",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FM",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "222",
    },
    unite: "euros",
    signe: "mixte",
  },

  production_immobilisee: {
    id: "production_immobilisee",
    nom: "Production immobilisée",
    description: "Travaux faits par l'entreprise pour elle-même",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FN",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "224",
    },
    unite: "euros",
    signe: "positif",
  },

  subventions_exploitation: {
    id: "subventions_exploitation",
    nom: "Subventions d'exploitation",
    description: "Subventions d'exploitation reçues. En liasse simplifiée 2033-B : case 226 UNIQUEMENT. NE PAS CONFONDRE avec case 230 'Autres produits'",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FO",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "226",
    },
    unite: "euros",
    signe: "positif",
  },

  reprises_provisions_exploitation: {
    id: "reprises_provisions_exploitation",
    nom: "Reprises sur provisions d'exploitation",
    description: "Reprises sur amortissements et provisions, transferts de charges. ATTENTION : Non isolable en liasse simplifiée 2033-B, mettre 0",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FP",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "NULL",
      formule: "Non isolable en liasse simplifiée - mettre 0",
    },
    unite: "euros",
    signe: "positif",
  },

  // Alias pour le schéma d'extraction (reprises_provisions = reprises_provisions_exploitation)
  reprises_provisions: {
    id: "reprises_provisions",
    nom: "Reprises sur provisions",
    description: "Reprises sur amortissements et provisions. ATTENTION : Non isolable en liasse simplifiée 2033-B, mettre 0",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FP",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "NULL",
      formule: "Non isolable en liasse simplifiée - mettre 0",
    },
    unite: "euros",
    signe: "positif",
  },

  autres_produits_exploitation: {
    id: "autres_produits_exploitation",
    nom: "Autres produits d'exploitation",
    description: "Autres produits de gestion courante",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FQ",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "230",
    },
    unite: "euros",
    signe: "positif",
  },

  total_produits_exploitation: {
    id: "total_produits_exploitation",
    nom: "Total des produits d'exploitation",
    description: "Somme des produits d'exploitation",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FR",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "232",
    },
    unite: "euros",
    signe: "positif",
  },

  // ---------------------------------------------------------------------------
  // COMPTE DE RÉSULTAT - CHARGES (2052 / 2033-B)
  // ---------------------------------------------------------------------------

  achats_marchandises: {
    id: "achats_marchandises",
    nom: "Achats de marchandises",
    description: "Achats de marchandises (y compris droits de douane)",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FS",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "234",
    },
    unite: "euros",
    signe: "positif",
  },

  variation_stock_marchandises: {
    id: "variation_stock_marchandises",
    nom: "Variation de stock de marchandises",
    description: "Variation des stocks de marchandises",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FT",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "236",
    },
    unite: "euros",
    signe: "mixte",
  },

  achats_matieres_premieres: {
    id: "achats_matieres_premieres",
    nom: "Achats de matières premières",
    description: "Achats de matières premières et autres approvisionnements",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FU",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "238",
    },
    unite: "euros",
    signe: "positif",
  },

  variation_stock_matieres: {
    id: "variation_stock_matieres",
    nom: "Variation de stock de matières",
    description: "Variation des stocks de matières premières",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FV",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "240",
    },
    unite: "euros",
    signe: "mixte",
  },

  autres_charges_externes: {
    id: "autres_charges_externes",
    nom: "Autres achats et charges externes",
    description: "Services extérieurs, locations, entretien, assurances, etc.",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FW",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "242",
    },
    unite: "euros",
    signe: "positif",
  },

  impots_taxes: {
    id: "impots_taxes",
    nom: "Impôts, taxes et versements assimilés",
    description:
      "Impôts et taxes (hors impôt sur les bénéfices) : taxe pro, taxe foncière, etc.",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FX",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "244",
    },
    unite: "euros",
    signe: "positif",
  },

  salaires_traitements: {
    id: "salaires_traitements",
    nom: "Salaires et traitements",
    description: "Rémunérations du personnel",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FY",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "250",
    },
    unite: "euros",
    signe: "positif",
  },

  charges_sociales: {
    id: "charges_sociales",
    nom: "Charges sociales",
    description: "Cotisations sociales patronales",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FZ",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "252",
    },
    unite: "euros",
    signe: "positif",
  },

  charges_personnel: {
    id: "charges_personnel",
    nom: "Charges de personnel",
    description: "Total des charges de personnel (salaires + charges sociales)",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "FY+FZ",
      formule: "FY + FZ (salaires + charges sociales)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "250+252",
      formule: "250 + 252",
    },
    unite: "euros",
    signe: "positif",
  },

  dotations_amortissements_exploitation: {
    id: "dotations_amortissements_exploitation",
    nom: "Dotations aux amortissements",
    description: "Dotations aux amortissements sur immobilisations",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "GA",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "254",
    },
    unite: "euros",
    signe: "positif",
  },

  dotations_provisions_exploitation: {
    id: "dotations_provisions_exploitation",
    nom: "Dotations aux provisions d'exploitation",
    description: "Dotations aux provisions sur actif circulant et risques",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "GB+GC",
      formule: "GB + GC (dotations provisions)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "256",
    },
    unite: "euros",
    signe: "positif",
  },

  // Alias pour le schéma d'extraction (dotations_amortissements = dotations + provisions)
  dotations_amortissements: {
    id: "dotations_amortissements",
    nom: "Dotations aux amortissements et provisions",
    description: "Dotations aux amortissements sur immobilisations + dotations aux provisions d'exploitation",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "GA+GB+GC",
      formule: "GA + GB + GC (amortissements + provisions actif + provisions risques)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "254+256",
      formule: "254 + 256 (amortissements + provisions)",
    },
    unite: "euros",
    signe: "positif",
  },

  autres_charges_exploitation: {
    id: "autres_charges_exploitation",
    nom: "Autres charges d'exploitation",
    description: "Redevances, autres charges de gestion courante",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "GD+GE",
      formule: "GD + GE (autres charges)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "262",
    },
    unite: "euros",
    signe: "positif",
  },

  total_charges_exploitation: {
    id: "total_charges_exploitation",
    nom: "Total des charges d'exploitation",
    description: "Somme des charges d'exploitation",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "GF",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "264",
    },
    unite: "euros",
    signe: "positif",
  },

  resultat_exploitation: {
    id: "resultat_exploitation",
    nom: "Résultat d'exploitation",
    description: "Produits d'exploitation - Charges d'exploitation",
    categorie: "resultat",
    normal: {
      formulaire: "2052",
      cases: "GG",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "270",
    },
    unite: "euros",
    signe: "mixte",
  },

  // ---------------------------------------------------------------------------
  // RÉSULTAT FINANCIER (2053 / 2033-B)
  // ---------------------------------------------------------------------------

  produits_financiers_participations: {
    id: "produits_financiers_participations",
    nom: "Produits financiers de participations",
    description: "Dividendes et produits des participations",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "GJ",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "280",
    },
    unite: "euros",
    signe: "positif",
  },

  autres_produits_financiers: {
    id: "autres_produits_financiers",
    nom: "Autres produits financiers",
    description:
      "Intérêts et produits assimilés, reprises de provisions financières",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "GK+GL+GM+GN+GO+GP",
      formule: "GK + GL + GM + GN + GO + GP (autres produits financiers)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "282+284",
      formule: "282 + 284",
    },
    unite: "euros",
    signe: "positif",
  },

  total_produits_financiers: {
    id: "total_produits_financiers",
    nom: "Total des produits financiers",
    description: "Somme des produits financiers",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "GQ",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "290",
    },
    unite: "euros",
    signe: "positif",
  },

  dotations_provisions_financieres: {
    id: "dotations_provisions_financieres",
    nom: "Dotations aux provisions financières",
    description: "Dotations aux amortissements et provisions financières",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "GR+GS",
      formule: "GR + GS (dotations financières)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "292",
    },
    unite: "euros",
    signe: "positif",
  },

  charges_financieres: {
    id: "charges_financieres",
    nom: "Charges financières",
    description:
      "Intérêts et charges assimilées (intérêts d'emprunts, agios, etc.)",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "GU",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "294",
    },
    unite: "euros",
    signe: "positif",
  },

  total_charges_financieres: {
    id: "total_charges_financieres",
    nom: "Total des charges financières",
    description: "Somme des charges financières",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "GV",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "296",
    },
    unite: "euros",
    signe: "positif",
  },

  resultat_financier: {
    id: "resultat_financier",
    nom: "Résultat financier",
    description: "Produits financiers - Charges financières",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "GW",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "298",
    },
    unite: "euros",
    signe: "mixte",
  },

  resultat_courant_avant_impots: {
    id: "resultat_courant_avant_impots",
    nom: "Résultat courant avant impôts",
    description: "Résultat d'exploitation + Résultat financier",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "GW",
      formule: "Résultat exploitation (GG) + Résultat financier (GW)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "300",
    },
    unite: "euros",
    signe: "mixte",
  },

  // ---------------------------------------------------------------------------
  // RÉSULTAT EXCEPTIONNEL (2053 / 2033-B)
  // ---------------------------------------------------------------------------

  produits_exceptionnels: {
    id: "produits_exceptionnels",
    nom: "Produits exceptionnels",
    description: "Produits exceptionnels sur opérations de gestion et en capital",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "HA+HB+HC+HD",
      formule: "HA + HB + HC + HD (produits exceptionnels)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "302",
    },
    unite: "euros",
    signe: "positif",
  },

  charges_exceptionnelles: {
    id: "charges_exceptionnelles",
    nom: "Charges exceptionnelles",
    description: "Charges exceptionnelles sur opérations de gestion et en capital",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "HE+HF+HG+HH",
      formule: "HE + HF + HG + HH (charges exceptionnelles)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "304",
    },
    unite: "euros",
    signe: "positif",
  },

  resultat_exceptionnel: {
    id: "resultat_exceptionnel",
    nom: "Résultat exceptionnel",
    description: "Produits exceptionnels - Charges exceptionnelles",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "HI",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "306",
    },
    unite: "euros",
    signe: "mixte",
  },

  participation_salaries: {
    id: "participation_salaries",
    nom: "Participation des salariés",
    description: "Participation des salariés aux résultats",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "HJ",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "308",
    },
    unite: "euros",
    signe: "positif",
  },

  impots_benefices: {
    id: "impots_benefices",
    nom: "Impôts sur les bénéfices",
    description: "Impôt sur les sociétés",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "HK",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "312",
    },
    unite: "euros",
    signe: "positif",
  },

  resultat_net: {
    id: "resultat_net",
    nom: "Résultat net",
    description:
      "Bénéfice ou perte de l'exercice (= résultat courant + résultat exceptionnel - participation - IS)",
    categorie: "resultat",
    normal: {
      formulaire: "2053",
      cases: "HN",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "310",
    },
    unite: "euros",
    signe: "mixte",
  },

  // ---------------------------------------------------------------------------
  // SOLDES INTERMÉDIAIRES DE GESTION (calculés)
  // ---------------------------------------------------------------------------

  marge_commerciale: {
    id: "marge_commerciale",
    nom: "Marge commerciale",
    description: "Ventes de marchandises - Coût d'achat des marchandises vendues",
    categorie: "sig",
    normal: {
      formulaire: "2052",
      cases: "FC-(FS+FT)",
      formule: "FC - (FS + FT) = Ventes - (Achats + Variation stock)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "210-(234+236)",
      formule: "210 - (234 + 236)",
    },
    unite: "euros",
    signe: "mixte",
  },

  production_exercice: {
    id: "production_exercice",
    nom: "Production de l'exercice",
    description: "Production vendue + stockée + immobilisée",
    categorie: "sig",
    normal: {
      formulaire: "2052",
      cases: "FD+FE+FF+FM+FN",
      formule: "FD + FE + FF + FM + FN",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "214+218+220+222",
      formule: "214 + 218 + 220 + 222",
    },
    unite: "euros",
    signe: "positif",
  },

  valeur_ajoutee: {
    id: "valeur_ajoutee",
    nom: "Valeur ajoutée",
    description:
      "Marge commerciale + Production - Consommations intermédiaires",
    categorie: "sig",
    normal: {
      formulaire: "2052",
      cases: "Calculé",
      formule:
        "(FC - FS - FT) + (FD + FE + FF + FM + FN) - (FU + FV + FW)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "Calculé",
      formule:
        "(210 - 234 - 236) + (214 + 218 + 220 + 222) - (238 + 240 + 242)",
    },
    unite: "euros",
    signe: "mixte",
  },

  ebe: {
    id: "ebe",
    nom: "Excédent brut d'exploitation (EBE)",
    description: "Valeur ajoutée + Subventions - Impôts - Charges personnel",
    categorie: "sig",
    normal: {
      formulaire: "2052",
      cases: "Calculé",
      formule: "VA + FO - FX - (FY + FZ)",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "Calculé",
      formule: "VA + 224 - 244 - (250 + 252)",
    },
    unite: "euros",
    signe: "mixte",
  },

  caf: {
    id: "caf",
    nom: "Capacité d'autofinancement (CAF)",
    description:
      "Résultat net + Dotations amortissements/provisions - Reprises - Plus/Moins values",
    categorie: "sig",
    normal: {
      formulaire: "2053",
      cases: "Calculé",
      formule:
        "HN + GA + GB + GC + GR + GS + HG - FP - GM - GO - GP - HC + HF - HD",
    },
    simplified: {
      formulaire: "2033-B",
      cases: "Calculé",
      formule: "310 + 254 + 256 + 292 - 226 - 284 +/- ajustements exceptionnels",
    },
    unite: "euros",
    signe: "mixte",
  },

  fonds_roulement: {
    id: "fonds_roulement",
    nom: "Fonds de roulement net global (FRNG)",
    description: "Ressources stables - Emplois stables",
    categorie: "sig",
    normal: {
      formulaire: "2050",
      cases: "Calculé",
      formule: "(DL + DQ + DR + DS + DT) - BK",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "Calculé",
      formule: "(142 + 150 + 154 + 156 + 164) - 048",
    },
    unite: "euros",
    signe: "mixte",
  },

  bfr: {
    id: "bfr",
    nom: "Besoin en fonds de roulement (BFR)",
    description: "Actif circulant (hors trésorerie) - Passif circulant (hors trésorerie)",
    categorie: "sig",
    normal: {
      formulaire: "2050",
      cases: "Calculé",
      formule:
        "(BL + BN + BP + BR + BT + BV + BX + BZ + CD + CF + CI + CK) - (DV + DW + DX + DY + DZ + EA + EB)",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "Calculé",
      formule:
        "(050 à 080 + 092) - (164 + 166 + 168 + 170 + 172 + 174 + 176)",
    },
    unite: "euros",
    signe: "mixte",
  },

  tresorerie_nette: {
    id: "tresorerie_nette",
    nom: "Trésorerie nette",
    description: "Fonds de roulement - BFR = Disponibilités - Découverts",
    categorie: "sig",
    normal: {
      formulaire: "2050",
      cases: "Calculé",
      formule: "(CG + CH) - EH",
    },
    simplified: {
      formulaire: "2033-A",
      cases: "Calculé",
      formule: "(082 + 086) - 195",
    },
    unite: "euros",
    signe: "mixte",
  },
};

// ============================================================================
// FONCTIONS D'AIDE
// ============================================================================

/**
 * Récupère la description complète des cases pour un champ donné
 * @param fieldId Identifiant du champ
 * @param isSimplified true pour liasse simplifiée, false pour liasse normale
 * @returns Description des cases à chercher
 */
export function getCaseDescription(
  fieldId: string,
  isSimplified: boolean = false
): {
  nom: string;
  description: string;
  formulaire: string;
  cases: string;
  formule?: string;
  colonne?: number;
} | null {
  const mapping = CERFA_MAPPINGS[fieldId];
  if (!mapping) {
    return null;
  }

  const source = isSimplified ? mapping.simplified : mapping.normal;

  return {
    nom: mapping.nom,
    description: mapping.description,
    formulaire: source.formulaire,
    cases: source.cases,
    formule: source.formule,
    colonne: source.colonne,
  };
}

/**
 * Récupère tous les mappings d'une catégorie
 * @param categorie Catégorie de champs
 * @returns Liste des mappings
 */
export function getMappingsByCategorie(
  categorie: CaseMapping["categorie"]
): CaseMapping[] {
  return Object.values(CERFA_MAPPINGS).filter((m) => m.categorie === categorie);
}

/**
 * Récupère tous les mappings d'un formulaire donné
 * @param formulaire Numéro du formulaire
 * @param isSimplified true pour liasse simplifiée
 * @returns Liste des mappings
 */
export function getMappingsByFormulaire(
  formulaire: string,
  isSimplified: boolean = false
): CaseMapping[] {
  return Object.values(CERFA_MAPPINGS).filter((m) => {
    const source = isSimplified ? m.simplified : m.normal;
    return source.formulaire === formulaire;
  });
}

/**
 * Génère un prompt d'extraction pour l'IA
 * @param fieldIds Liste des champs à extraire
 * @param isSimplified true pour liasse simplifiée
 * @returns Texte descriptif des cases à chercher
 */
export function generateExtractionPrompt(
  fieldIds: string[],
  isSimplified: boolean = false
): string {
  const lines: string[] = [];

  lines.push(
    `Type de liasse : ${isSimplified ? "Simplifiée (2033)" : "Normale (2050-2059)"}`
  );
  lines.push("");
  lines.push("Champs à extraire :");
  lines.push("");

  for (const fieldId of fieldIds) {
    const desc = getCaseDescription(fieldId, isSimplified);
    if (desc) {
      lines.push(`- ${desc.nom} :`);
      lines.push(`  Formulaire : ${desc.formulaire}`);
      lines.push(`  Cases : ${desc.cases}`);
      if (desc.formule) {
        lines.push(`  Calcul : ${desc.formule}`);
      }
      if (desc.colonne) {
        lines.push(`  Colonne : ${desc.colonne}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Liste des champs essentiels pour le calcul des ratios
 */
export const ESSENTIAL_FIELDS = [
  // Bilan actif
  "actif_immobilise",
  "stocks",
  "creances_clients",
  "disponibilites",
  "actif_circulant",
  "total_actif",
  // Bilan passif
  "capitaux_propres",
  "dettes_financieres",
  "dettes_fournisseurs",
  "decouvert_bancaire",
  "total_passif",
  // Compte de résultat
  "chiffre_affaires",
  "ventes_marchandises",
  "achats_marchandises",
  "variation_stock_marchandises",
  "achats_matieres_premieres",
  "variation_stock_matieres",
  "autres_charges_externes",
  "impots_taxes",
  "charges_personnel",
  "charges_financieres",
  "resultat_exploitation",
  "resultat_net",
  // Complémentaires
  "subventions_exploitation",
  "dotations_amortissements_exploitation",
] as const;

/**
 * Liste des champs pour le calcul des SIG
 */
export const SIG_FIELDS = [
  "marge_commerciale",
  "production_exercice",
  "valeur_ajoutee",
  "ebe",
  "caf",
  "fonds_roulement",
  "bfr",
  "tresorerie_nette",
] as const;
