/**
 * Configuration complète des ratios avec leur mapping vers les benchmarks API
 * Permet d'afficher tous les ratios dans le comparatif avec leur benchmark (si disponible)
 */

import type { FamilyId } from '@/config/ratios.config'

export interface RatioBenchmarkConfig {
  id: string
  name: string
  famille: FamilyId
  unit: '%' | 'jours' | 'ratio'
  higherIsBetter: boolean
  // Clé du ratio dans les données calculées (peut différer de l'id)
  ratioKey: string
  // Préfixe API data.economie.gouv.fr (null si pas de benchmark)
  apiPrefix: string | null
}

/**
 * Configuration complète de tous les ratios par famille
 * avec leur mapping vers les benchmarks disponibles
 */
export const RATIOS_BENCHMARK_CONFIG: Record<FamilyId, RatioBenchmarkConfig[]> = {
  // ---------------------------------------------------------------------------
  // LIQUIDITÉ (30%)
  // ---------------------------------------------------------------------------
  liquidite: [
    {
      id: 'liquidite_generale',
      name: 'Liquidité générale',
      famille: 'liquidite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'ratio_liquidite_generale',
      apiPrefix: 'ratio_de_liquidite', // ✅ Benchmark disponible
    },
    {
      id: 'liquidite_immediate',
      name: 'Liquidité immédiate',
      famille: 'liquidite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'ratio_liquidite_immediate',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'couverture_bfr',
      name: 'Couverture du BFR',
      famille: 'liquidite',
      unit: '%',
      higherIsBetter: false,
      ratioKey: 'ratio_couverture_bfr',
      apiPrefix: null, // ❌ Pas de benchmark
    },
  ],

  // ---------------------------------------------------------------------------
  // RENTABILITÉ (20%)
  // ---------------------------------------------------------------------------
  rentabilite: [
    {
      id: 'taux_ebe',
      name: "Taux d'EBE",
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'taux_ebe',
      apiPrefix: 'marge_ebe', // ✅ Benchmark disponible
    },
    {
      id: 'taux_marge_brute',
      name: 'Taux de marge brute',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'taux_marge_brute',
      apiPrefix: 'part_ca_marge_brute', // ✅ Benchmark disponible
    },
    {
      id: 'rentabilite_commerciale',
      name: 'Rentabilité commerciale',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'rentabilite_commerciale',
      apiPrefix: 'part_ca_resultat_net', // ✅ Benchmark disponible
    },
    {
      id: 'taux_va',
      name: 'Taux de valeur ajoutée',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'taux_va',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'taux_rentabilite_financiere',
      name: 'Taux de rentabilité financière',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'taux_rentabilite_financiere',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'rentabilite_economique',
      name: 'Rentabilité économique',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'rentabilite_economique',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'taux_marge_industrielle',
      name: 'Taux de marge industrielle',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'taux_marge_industrielle',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'taux_marge_commerciale',
      name: 'Taux de marge commerciale',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'taux_marge_commerciale',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'charges_personnel_va',
      name: 'Charges de personnel / VA',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: false,
      ratioKey: 'charges_personnel_va',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'charges_financieres_va',
      name: 'Charges financières / VA',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: false,
      ratioKey: 'charges_financieres_va',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'impots_taxes_va',
      name: 'Impôts et taxes / VA',
      famille: 'rentabilite',
      unit: '%',
      higherIsBetter: false,
      ratioKey: 'impots_taxes_va',
      apiPrefix: null, // ❌ Pas de benchmark
    },
  ],

  // ---------------------------------------------------------------------------
  // SOLVABILITÉ (20%)
  // ---------------------------------------------------------------------------
  solvabilite: [
    {
      id: 'taux_endettement',
      name: "Taux d'endettement",
      famille: 'solvabilite',
      unit: '%',
      higherIsBetter: false,
      ratioKey: 'taux_endettement',
      apiPrefix: 'taux_d_endettement', // ✅ Benchmark disponible
    },
    {
      id: 'autonomie_financiere',
      name: 'Autonomie financière',
      famille: 'solvabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'autonomie_financiere',
      apiPrefix: 'autonomie_financiere', // ✅ Benchmark disponible
    },
    {
      id: 'capacite_remboursement',
      name: 'Capacité de remboursement',
      famille: 'solvabilite',
      unit: 'jours',
      higherIsBetter: false,
      ratioKey: 'capacite_remboursement',
      apiPrefix: 'capacite_de_remboursement', // ✅ Benchmark disponible
    },
    {
      id: 'equilibre_global',
      name: 'Équilibre financier global',
      famille: 'solvabilite',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'equilibre_global',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'poids_decouvert',
      name: 'Poids du découvert',
      famille: 'solvabilite',
      unit: '%',
      higherIsBetter: false,
      ratioKey: 'poids_decouvert',
      apiPrefix: null, // ❌ Pas de benchmark
    },
  ],

  // ---------------------------------------------------------------------------
  // ACTIVITÉ (15%)
  // ---------------------------------------------------------------------------
  activite: [
    {
      id: 'delai_clients',
      name: 'Délai clients',
      famille: 'activite',
      unit: 'jours',
      higherIsBetter: false,
      ratioKey: 'delai_clients',
      apiPrefix: 'credit_clients_jours', // ✅ Benchmark disponible
    },
    {
      id: 'delai_fournisseurs',
      name: 'Délai fournisseurs',
      famille: 'activite',
      unit: 'jours',
      higherIsBetter: true, // On profite du crédit
      ratioKey: 'delai_fournisseurs',
      apiPrefix: 'credit_fournisseurs_jours', // ✅ Benchmark disponible
    },
    {
      id: 'rotation_stocks',
      name: 'Rotation des stocks',
      famille: 'activite',
      unit: 'jours',
      higherIsBetter: false,
      ratioKey: 'rotation_stocks',
      apiPrefix: 'rotation_des_stocks_jours', // ✅ Benchmark disponible
    },
    {
      id: 'ratio_fonds_roulement',
      name: 'Ratio de fonds de roulement',
      famille: 'activite',
      unit: 'ratio',
      higherIsBetter: true,
      ratioKey: 'ratio_fonds_roulement',
      apiPrefix: null, // ❌ Pas de benchmark
    },
    {
      id: 'cash_flow_exploitation',
      name: "Cash-flow d'exploitation",
      famille: 'activite',
      unit: 'ratio',
      higherIsBetter: true,
      ratioKey: 'cash_flow_exploitation',
      apiPrefix: null, // ❌ Pas de benchmark
    },
  ],

  // ---------------------------------------------------------------------------
  // ÉVOLUTION (15%) - Pas de benchmarks disponibles
  // ---------------------------------------------------------------------------
  evolution: [
    {
      id: 'variation_ca_n1',
      name: 'Variation du CA N/N-1',
      famille: 'evolution',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'variation_ca_n1',
      apiPrefix: null,
    },
    {
      id: 'variation_ca_n2',
      name: 'Variation du CA N/N-2',
      famille: 'evolution',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'variation_ca_n2',
      apiPrefix: null,
    },
    {
      id: 'variation_va_n1',
      name: 'Variation de la VA N/N-1',
      famille: 'evolution',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'variation_va_n1',
      apiPrefix: null,
    },
    {
      id: 'variation_va_n2',
      name: 'Variation de la VA N/N-2',
      famille: 'evolution',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'variation_va_n2',
      apiPrefix: null,
    },
    {
      id: 'variation_resultat_n1',
      name: 'Variation du résultat N/N-1',
      famille: 'evolution',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'variation_resultat_n1',
      apiPrefix: null,
    },
    {
      id: 'variation_resultat_n2',
      name: 'Variation du résultat N/N-2',
      famille: 'evolution',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'variation_resultat_n2',
      apiPrefix: null,
    },
    {
      id: 'variation_marge_commerciale_n1',
      name: 'Variation marge commerciale N/N-1',
      famille: 'evolution',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'variation_marge_commerciale_n1',
      apiPrefix: null,
    },
    {
      id: 'variation_marge_brute_n1',
      name: 'Variation marge brute N/N-1',
      famille: 'evolution',
      unit: '%',
      higherIsBetter: true,
      ratioKey: 'variation_marge_brute_n1',
      apiPrefix: null,
    },
  ],
}

/**
 * Obtient la liste plate de tous les ratios avec benchmarks
 */
export function getAllRatiosWithBenchmarkConfig(): RatioBenchmarkConfig[] {
  return Object.values(RATIOS_BENCHMARK_CONFIG).flat()
}

/**
 * Obtient les ratios d'une famille
 */
export function getRatiosByFamille(famille: FamilyId): RatioBenchmarkConfig[] {
  return RATIOS_BENCHMARK_CONFIG[famille] || []
}

/**
 * Compte les ratios avec benchmarks disponibles
 */
export function countRatiosWithBenchmark(): { total: number; withBenchmark: number } {
  const all = getAllRatiosWithBenchmarkConfig()
  return {
    total: all.length,
    withBenchmark: all.filter((r) => r.apiPrefix !== null).length,
  }
}
