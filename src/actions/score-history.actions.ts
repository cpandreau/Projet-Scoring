'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateEnterpriseScore } from './score.actions'

export interface RecalculateResult {
  success: boolean
  error?: string
  scoreGlobal?: number
}

export interface DeleteScoreResult {
  success: boolean
  error?: string
}

/**
 * Force le recalcul et la sauvegarde du score d'une entreprise
 */
export async function recalculateAndSaveScore(enterpriseId: string): Promise<RecalculateResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'Non authentifié',
    }
  }

  // Vérifier l'accès au dossier
  const { data: enterprise, error: enterpriseError } = await supabase
    .from('dossiers')
    .select('id, user_id')
    .eq('id', enterpriseId)
    .single()

  if (enterpriseError || !enterprise) {
    return {
      success: false,
      error: 'Dossier non trouvé',
    }
  }

  if (enterprise.user_id !== user.id) {
    return {
      success: false,
      error: 'Accès non autorisé',
    }
  }

  // Recalculer le score avec sauvegarde forcée
  const result = await calculateEnterpriseScore(enterpriseId, {
    saveToHistory: true,
  })

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Erreur lors du calcul du score',
    }
  }

  if (!result.hasValidatedData) {
    return {
      success: false,
      error: 'Aucune donnée validée disponible pour calculer le score',
    }
  }

  // Revalider le cache pour mettre à jour l'affichage
  revalidatePath(`/enterprise/${enterpriseId}`)

  return {
    success: true,
    scoreGlobal: result.score?.scoreGlobal,
  }
}

/**
 * Supprime une entrée de l'historique des scores
 */
export async function deleteScoreHistory(scoreId: string): Promise<DeleteScoreResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'Non authentifié',
    }
  }

  // Récupérer le score pour vérifier les droits
  const { data: score, error: scoreError } = await supabase
    .from('scores_history')
    .select('id, enterprise_id, dossiers!inner(user_id)')
    .eq('id', scoreId)
    .single()

  if (scoreError || !score) {
    return {
      success: false,
      error: 'Score non trouvé',
    }
  }

  // Vérifier que l'utilisateur est propriétaire du dossier
  const dossier = score.dossiers as unknown as { user_id: string }
  if (dossier.user_id !== user.id) {
    return {
      success: false,
      error: 'Accès non autorisé',
    }
  }

  // Supprimer le score
  const { error: deleteError } = await supabase.from('scores_history').delete().eq('id', scoreId)

  if (deleteError) {
    console.error('Error deleting score:', deleteError)
    return {
      success: false,
      error: 'Erreur lors de la suppression',
    }
  }

  // Revalider le cache
  revalidatePath(`/enterprise/${score.enterprise_id}`)

  return {
    success: true,
  }
}
