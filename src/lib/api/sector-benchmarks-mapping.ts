/**
 * Mapping entre nos ratios et les ratios de l'API BCE/INPI
 */

export interface RatioMapping {
  ourRatioId: string;
  apiPrefix: string; // Prefixe dans l'API (ex: "ratio_de_liquidite")
  ourName: string;
  unite: string;
  sensInverse: boolean; // true si "moins c'est mieux"
}

export const RATIO_MAPPINGS: RatioMapping[] = [
  // Liquidite
  {
    ourRatioId: "ratio_liquidite_generale",
    apiPrefix: "ratio_de_liquidite",
    ourName: "Liquidite generale",
    unite: "%",
    sensInverse: false,
  },

  // Rentabilite
  {
    ourRatioId: "taux_marge_brute",
    apiPrefix: "part_ca_marge_brute",
    ourName: "Taux de marge brute",
    unite: "%",
    sensInverse: false,
  },
  {
    ourRatioId: "taux_ebe",
    apiPrefix: "marge_ebe",
    ourName: "Taux d'EBE",
    unite: "%",
    sensInverse: false,
  },
  {
    ourRatioId: "rentabilite_commerciale",
    apiPrefix: "part_ca_resultat_net",
    ourName: "Rentabilite commerciale",
    unite: "%",
    sensInverse: false,
  },

  // Solvabilite
  {
    ourRatioId: "taux_endettement",
    apiPrefix: "taux_d_endettement",
    ourName: "Taux d'endettement",
    unite: "%",
    sensInverse: true, // Moins c'est mieux
  },
  {
    ourRatioId: "autonomie_financiere",
    apiPrefix: "autonomie_financiere",
    ourName: "Autonomie financiere",
    unite: "%",
    sensInverse: false,
  },
  {
    ourRatioId: "capacite_remboursement",
    apiPrefix: "capacite_de_remboursement",
    ourName: "Capacite de remboursement",
    unite: "annees",
    sensInverse: true, // Moins c'est mieux
  },

  // Activite
  {
    ourRatioId: "delai_clients",
    apiPrefix: "credit_clients_jours",
    ourName: "Delai clients",
    unite: "jours",
    sensInverse: true, // Moins c'est mieux
  },
  {
    ourRatioId: "delai_fournisseurs",
    apiPrefix: "credit_fournisseurs_jours",
    ourName: "Delai fournisseurs",
    unite: "jours",
    sensInverse: false, // Plus c'est mieux (on profite du credit)
  },
  {
    ourRatioId: "rotation_stocks",
    apiPrefix: "rotation_des_stocks_jours",
    ourName: "Rotation des stocks",
    unite: "jours",
    sensInverse: true, // Moins c'est mieux
  },
];

/**
 * Extrait les quartiles d'un ratio depuis un record de l'API
 */
export function extractQuartiles(
  record: Record<string, unknown>,
  apiPrefix: string
): {
  q10: number | null;
  q25: number | null;
  q50: number | null;
  q75: number | null;
  q90: number | null;
} {
  return {
    q10: (record[`${apiPrefix}_q10`] as number) ?? null,
    q25: (record[`${apiPrefix}_q25`] as number) ?? null,
    q50: (record[`${apiPrefix}_q50`] as number) ?? null,
    q75: (record[`${apiPrefix}_q75`] as number) ?? null,
    q90: (record[`${apiPrefix}_q90`] as number) ?? null,
  };
}
