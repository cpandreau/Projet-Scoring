import type { FamilyId } from '@/config/ratios.config'
import type { RatioDetail, ScoreResult } from '@/lib/ratios'
import { createClient } from '@/lib/supabase/server'

/**
 * Entrée d'historique de score
 */
export interface ScoreHistoryEntry {
  id: string
  created_at: string
  enterprise_id: string
  annee_exercice: number
  score_global: number
  score_liquidite: number | null
  score_rentabilite: number | null
  score_solvabilite: number | null
  score_activite: number | null
  score_evolution: number | null
  detail_ratios: Record<string, RatioDetail>
}

/**
 * Données pour sauvegarder un score
 */
export interface SaveScoreData {
  anneeExercice: number
  scoreResult: ScoreResult
}

/**
 * Convertit un ScoreResult en format pour la base de données
 */
function scoreResultToDbFormat(
  enterpriseId: string,
  anneeExercice: number,
  scoreResult: ScoreResult
): {
  enterprise_id: string
  annee_exercice: number
  score_global: number
  score_liquidite: number | null
  score_rentabilite: number | null
  score_solvabilite: number | null
  score_activite: number | null
  score_evolution: number | null
  detail_ratios: Record<string, RatioDetail>
} {
  const getFamilyScore = (familyId: FamilyId): number | null => {
    const family = scoreResult.scoreParFamille[familyId]
    return family ? family.score : null
  }

  return {
    enterprise_id: enterpriseId,
    annee_exercice: anneeExercice,
    score_global: scoreResult.scoreGlobal,
    score_liquidite: getFamilyScore('liquidite'),
    score_rentabilite: getFamilyScore('rentabilite'),
    score_solvabilite: getFamilyScore('solvabilite'),
    score_activite: getFamilyScore('activite'),
    score_evolution: getFamilyScore('evolution'),
    detail_ratios: scoreResult.detailRatios,
  }
}

/**
 * Convertit une entrée de base de données en ScoreHistoryEntry
 */
function dbRowToScoreHistoryEntry(row: {
  id: string
  created_at: string
  enterprise_id: string
  annee_exercice: number
  score_global: number
  score_liquidite: number | null
  score_rentabilite: number | null
  score_solvabilite: number | null
  score_activite: number | null
  score_evolution: number | null
  detail_ratios: unknown
}): ScoreHistoryEntry {
  return {
    id: row.id,
    created_at: row.created_at,
    enterprise_id: row.enterprise_id,
    annee_exercice: row.annee_exercice,
    score_global: Number(row.score_global),
    score_liquidite: row.score_liquidite !== null ? Number(row.score_liquidite) : null,
    score_rentabilite: row.score_rentabilite !== null ? Number(row.score_rentabilite) : null,
    score_solvabilite: row.score_solvabilite !== null ? Number(row.score_solvabilite) : null,
    score_activite: row.score_activite !== null ? Number(row.score_activite) : null,
    score_evolution: row.score_evolution !== null ? Number(row.score_evolution) : null,
    detail_ratios: row.detail_ratios as Record<string, RatioDetail>,
  }
}

/**
 * Sauvegarde un nouveau score dans l'historique
 */
export async function saveScore(
  enterpriseId: string,
  data: SaveScoreData
): Promise<ScoreHistoryEntry | null> {
  const supabase = await createClient()

  const dbData = scoreResultToDbFormat(enterpriseId, data.anneeExercice, data.scoreResult)

  const { data: inserted, error } = await supabase
    .from('scores_history')
    .insert(dbData)
    .select()
    .single()

  if (error) {
    console.error('Error saving score:', error)
    return null
  }

  return dbRowToScoreHistoryEntry(inserted)
}

/**
 * Récupère l'historique complet des scores d'une entreprise
 * Trié par date de création (plus récent en premier)
 */
export async function getScoreHistory(enterpriseId: string): Promise<ScoreHistoryEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scores_history')
    .select('*')
    .eq('enterprise_id', enterpriseId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching score history:', error)
    return []
  }

  return data.map(dbRowToScoreHistoryEntry)
}

/**
 * Récupère le dernier score calculé pour une entreprise
 */
export async function getLatestScore(enterpriseId: string): Promise<ScoreHistoryEntry | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scores_history')
    .select('*')
    .eq('enterprise_id', enterpriseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching latest score:', error)
    return null
  }

  return dbRowToScoreHistoryEntry(data)
}

/**
 * Récupère l'historique des scores par année d'exercice
 * Utile pour comparer l'évolution des scores année par année
 */
export async function getScoreHistoryByYear(enterpriseId: string): Promise<ScoreHistoryEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scores_history')
    .select('*')
    .eq('enterprise_id', enterpriseId)
    .order('annee_exercice', { ascending: false })

  if (error) {
    console.error('Error fetching score history by year:', error)
    return []
  }

  return data.map(dbRowToScoreHistoryEntry)
}

/**
 * Supprime tous les scores d'une entreprise (utile pour le recalcul complet)
 */
export async function clearScoreHistory(enterpriseId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('scores_history').delete().eq('enterprise_id', enterpriseId)

  if (error) {
    console.error('Error clearing score history:', error)
    return false
  }

  return true
}
