/**
 * Service pour recuperer les benchmarks sectoriels via l'API data.economie.gouv.fr
 * Structure reelle du dataset ratios_inpi_bce_sectors
 */

const API_BASE_URL =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets";
const DATASET_SECTORS = "ratios_inpi_bce_sectors";

// Structure d'un enregistrement de l'API
export interface SectorBenchmarkRecord {
  classe_naf: string; // Ex: "6920" (4 chiffres)
  classe_ca: string; // Ex: "<2M", "2M-10M", ">10M"
  exercice: string; // Ex: "2022"
  cohorte: number; // Nombre d'entreprises dans la cohorte

  // Ratios avec leurs percentiles
  ratio_de_liquidite_q10: number | null;
  ratio_de_liquidite_q25: number | null;
  ratio_de_liquidite_q50: number | null;
  ratio_de_liquidite_q75: number | null;
  ratio_de_liquidite_q90: number | null;

  taux_d_endettement_q10: number | null;
  taux_d_endettement_q25: number | null;
  taux_d_endettement_q50: number | null;
  taux_d_endettement_q75: number | null;
  taux_d_endettement_q90: number | null;

  autonomie_financiere_q10: number | null;
  autonomie_financiere_q25: number | null;
  autonomie_financiere_q50: number | null;
  autonomie_financiere_q75: number | null;
  autonomie_financiere_q90: number | null;

  credit_clients_jours_q10: number | null;
  credit_clients_jours_q25: number | null;
  credit_clients_jours_q50: number | null;
  credit_clients_jours_q75: number | null;
  credit_clients_jours_q90: number | null;

  credit_fournisseurs_jours_q10: number | null;
  credit_fournisseurs_jours_q25: number | null;
  credit_fournisseurs_jours_q50: number | null;
  credit_fournisseurs_jours_q75: number | null;
  credit_fournisseurs_jours_q90: number | null;

  part_ca_marge_brute_q10: number | null;
  part_ca_marge_brute_q25: number | null;
  part_ca_marge_brute_q50: number | null;
  part_ca_marge_brute_q75: number | null;
  part_ca_marge_brute_q90: number | null;

  part_ca_ebe_q10: number | null;
  part_ca_ebe_q25: number | null;
  part_ca_ebe_q50: number | null;
  part_ca_ebe_q75: number | null;
  part_ca_ebe_q90: number | null;

  marge_ebe_q10: number | null;
  marge_ebe_q25: number | null;
  marge_ebe_q50: number | null;
  marge_ebe_q75: number | null;
  marge_ebe_q90: number | null;

  part_ca_resultat_net_q10: number | null;
  part_ca_resultat_net_q25: number | null;
  part_ca_resultat_net_q50: number | null;
  part_ca_resultat_net_q75: number | null;
  part_ca_resultat_net_q90: number | null;

  caf_sur_ca_q10: number | null;
  caf_sur_ca_q25: number | null;
  caf_sur_ca_q50: number | null;
  caf_sur_ca_q75: number | null;
  caf_sur_ca_q90: number | null;

  capacite_de_remboursement_q10: number | null;
  capacite_de_remboursement_q25: number | null;
  capacite_de_remboursement_q50: number | null;
  capacite_de_remboursement_q75: number | null;
  capacite_de_remboursement_q90: number | null;

  rotation_des_stocks_jours_q10: number | null;
  rotation_des_stocks_jours_q25: number | null;
  rotation_des_stocks_jours_q50: number | null;
  rotation_des_stocks_jours_q75: number | null;
  rotation_des_stocks_jours_q90: number | null;
}

// Tranches de CA
export const TRANCHES_CA = {
  MICRO: "<2M", // CA < 2M
  MOYEN: "2M-10M", // 2M - 10M
  GRAND: ">10M", // > 10M
} as const;

export type TrancheCA = keyof typeof TRANCHES_CA;

/**
 * Determine la tranche de CA a partir d'un montant
 */
export function getTrancheCA(chiffreAffaires: number): TrancheCA {
  if (chiffreAffaires < 2000000) return "MICRO";
  if (chiffreAffaires < 10000000) return "MOYEN";
  return "GRAND";
}

/**
 * Recupere les benchmarks sectoriels depuis l'API
 */
export async function fetchSectorBenchmarks(
  codeNaf: string,
  chiffreAffaires: number
): Promise<SectorBenchmarkRecord | null> {
  try {
    // Prendre les 2 premiers caracteres du code NAF pour chercher le secteur
    const codeNaf2 = codeNaf.substring(0, 2);
    const trancheCA = getTrancheCA(chiffreAffaires);
    const classeCA = TRANCHES_CA[trancheCA];

    // Construire la requete avec WHERE
    const conditions: string[] = [];
    conditions.push(`classe_naf LIKE '${codeNaf2}%'`);
    conditions.push(`classe_ca = '${classeCA}'`);

    const whereClause = encodeURIComponent(conditions.join(" AND "));

    // Trier par exercice decroissant pour avoir l'annee la plus recente
    const url = `${API_BASE_URL}/${DATASET_SECTORS}/records?limit=10&where=${whereClause}&order_by=exercice DESC`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // Cache 24h
    });

    if (!response.ok) {
      console.error("[SectorBenchmarks] API error:", response.status);

      // Fallback : essayer sans filtre de CA
      const fallbackWhere = encodeURIComponent(`classe_naf LIKE '${codeNaf2}%'`);
      const fallbackUrl = `${API_BASE_URL}/${DATASET_SECTORS}/records?limit=10&where=${fallbackWhere}&order_by=exercice DESC`;

      const fallbackResponse = await fetch(fallbackUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      });

      if (!fallbackResponse.ok) {
        console.error(
          "[SectorBenchmarks] Fallback failed:",
          fallbackResponse.status
        );
        return null;
      }

      const fallbackData = await fallbackResponse.json();
      if (fallbackData.results?.length > 0) {
        return fallbackData.results[0];
      }
      return null;
    }

    const data = await response.json();

    if (data.results?.length > 0) {
      return data.results[0]; // Retourner le premier (annee la plus recente)
    }

    return null;
  } catch (error) {
    console.error("[SectorBenchmarks] Error:", error);
    return null;
  }
}
