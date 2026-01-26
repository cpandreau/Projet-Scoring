import { createClient } from '@/lib/supabase/server'
import type { Enterprise, EnterpriseStatus } from '@/types'

export interface GlobalStats {
  // Entreprises
  totalEnterprises: number
  enterprisesByStatus: Record<EnterpriseStatus, number>

  // Documents
  totalDocuments: number
  documentsValidated: number

  // Scores
  analyzedEnterprises: number
  averageScore: number | null
  scoreDistribution: {
    critical: number // < 4
    warning: number // 4-6
    good: number // 6-8
    excellent: number // >= 8
  }
}

/**
 * Récupère les statistiques globales pour un utilisateur
 * Utilise une RPC PostgreSQL pour optimiser les performances (1 requête au lieu de 4+)
 */
export async function getGlobalStats(userId: string): Promise<GlobalStats> {
  const supabase = await createClient()

  // Valeurs par défaut en cas d'erreur
  const defaultStats: GlobalStats = {
    totalEnterprises: 0,
    enterprisesByStatus: {
      brouillon: 0,
      documents_uploades: 0,
      extrait: 0,
      valide: 0,
      analyse: 0,
    },
    totalDocuments: 0,
    documentsValidated: 0,
    analyzedEnterprises: 0,
    averageScore: null,
    scoreDistribution: {
      critical: 0,
      warning: 0,
      good: 0,
      excellent: 0,
    },
  }

  const { data, error } = await supabase.rpc('get_global_stats', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error fetching global stats via RPC:', error)
    return defaultStats
  }

  if (!data) {
    return defaultStats
  }

  // Mapper la réponse RPC vers le type GlobalStats
  return {
    totalEnterprises: data.totalEnterprises ?? 0,
    enterprisesByStatus: data.enterprisesByStatus ?? defaultStats.enterprisesByStatus,
    totalDocuments: data.totalDocuments ?? 0,
    documentsValidated: data.documentsValidated ?? 0,
    analyzedEnterprises: data.analyzedEnterprises ?? 0,
    averageScore: data.averageScore ?? null,
    scoreDistribution: data.scoreDistribution ?? defaultStats.scoreDistribution,
  }
}

/**
 * Entreprise récente avec score optionnel
 */
export interface RecentEnterprise extends Enterprise {
  score: number | null
}

/**
 * Récupère les entreprises récentes avec leur score
 * Utilise une RPC PostgreSQL pour optimiser les performances
 */
export async function getRecentEnterprises(
  userId: string,
  limit: number = 5
): Promise<RecentEnterprise[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_recent_enterprises', {
    p_user_id: userId,
    p_limit: limit,
  })

  if (error) {
    console.error('Error fetching recent enterprises via RPC:', error)
    return []
  }

  return (data as RecentEnterprise[]) ?? []
}

/**
 * Entreprise à risque avec score
 */
export interface AtRiskEnterprise {
  id: string
  raison_sociale: string | null
  siren: string | null
  score: number
}

/**
 * Récupère les entreprises avec un score < 5 (à risque)
 * Triées par score croissant (les plus à risque en premier)
 * Utilise une RPC PostgreSQL pour optimiser les performances
 */
export async function getAtRiskEnterprises(
  userId: string,
  limit: number = 10
): Promise<AtRiskEnterprise[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_at_risk_enterprises', {
    p_user_id: userId,
    p_limit: limit,
  })

  if (error) {
    console.error('Error fetching at-risk enterprises via RPC:', error)
    return []
  }

  return (data as AtRiskEnterprise[]) ?? []
}
