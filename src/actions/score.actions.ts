'use server'

import type { FamilyId } from '@/config/ratios.config'
import type { RatioDetail } from '@/lib/ratios'
import { calculateRatios, calculateScore, type ScoreResult } from '@/lib/ratios'
import { createClient } from '@/lib/supabase/server'
import type { ExtractionData } from '@/schemas/extraction.schema'
import { extractValues } from '@/schemas/extraction.schema'

// Score d'une année avec ses données
export interface YearScore {
  annee: number
  score: ScoreResult
  extractionData: ExtractionData
}

export interface EnterpriseScoreResult {
  success: boolean
  score?: ScoreResult
  extractionData?: ExtractionData
  anneesDisponibles?: number[]
  scoresParAnnee?: YearScore[] // Scores calculés pour chaque année disponible
  error?: string
  hasValidatedData: boolean
  savedToHistory?: boolean // Indique si le score a été sauvegardé
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
 * Sauvegarde ou met à jour le score dans l'historique
 * Un seul score par entreprise et par année d'exercice
 */
async function saveOrUpdateScoreHistory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  enterpriseId: string,
  anneeExercice: number,
  scoreResult: ScoreResult
): Promise<boolean> {
  const dbData = scoreResultToDbFormat(enterpriseId, anneeExercice, scoreResult)

  // Vérifier si un score existe déjà pour cette entreprise et année
  const { data: existing } = await supabase
    .from('scores_history')
    .select('id')
    .eq('enterprise_id', enterpriseId)
    .eq('annee_exercice', anneeExercice)
    .single()

  if (existing) {
    // Mettre à jour le score existant
    const { error } = await supabase
      .from('scores_history')
      .update({
        ...dbData,
        created_at: new Date().toISOString(), // Mettre à jour la date
      })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating score history:', error)
      return false
    }
  } else {
    // Insérer un nouveau score
    const { error } = await supabase.from('scores_history').insert(dbData)

    if (error) {
      console.error('Error inserting score history:', error)
      return false
    }
  }

  return true
}

/**
 * Met à jour le statut du dossier à "analyse"
 */
async function updateEnterpriseStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  enterpriseId: string
): Promise<void> {
  const { error } = await supabase
    .from('dossiers')
    .update({ statut: 'analyse' })
    .eq('id', enterpriseId)

  if (error) {
    console.error('Error updating enterprise status:', error)
  }
}

/**
 * Calcule le score de défaillance d'une entreprise
 * À partir des données extraites validées (multi-années)
 * Sauvegarde automatiquement le score dans l'historique
 */
export async function calculateEnterpriseScore(
  enterpriseId: string,
  options?: { saveToHistory?: boolean }
): Promise<EnterpriseScoreResult> {
  const { saveToHistory = true } = options || {}
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'Non authentifié',
      hasValidatedData: false,
    }
  }

  // Vérifier l'accès au dossier
  const { data: enterprise, error: enterpriseError } = await supabase
    .from('dossiers')
    .select('id, user_id, statut')
    .eq('id', enterpriseId)
    .single()

  if (enterpriseError || !enterprise) {
    return {
      success: false,
      error: 'Dossier non trouvé',
      hasValidatedData: false,
    }
  }

  if (enterprise.user_id !== user.id) {
    return {
      success: false,
      error: 'Accès non autorisé',
      hasValidatedData: false,
    }
  }

  // Récupérer toutes les données extraites validées avec l'année d'exercice
  const { data: extractions, error: extractionError } = await supabase
    .from('donnees_extraites')
    .select('donnees, documents!inner(dossier_id, annee_exercice)')
    .eq('documents.dossier_id', enterpriseId)
    .eq('is_validated', true)

  if (extractionError) {
    console.error('Error fetching extractions:', extractionError)
    return {
      success: false,
      error: 'Erreur lors de la récupération des données',
      hasValidatedData: false,
    }
  }

  // Pas de données validées
  if (!extractions || extractions.length === 0) {
    return {
      success: true,
      hasValidatedData: false,
    }
  }

  // Organiser les extractions par année
  const extractionsByYear: Map<number, ExtractionData> = new Map()

  for (const extraction of extractions) {
    // Avec !inner, Supabase retourne un objet unique (pas un array)
    const doc = extraction.documents as unknown as { annee_exercice: number | null }
    const annee = doc.annee_exercice

    if (annee !== null) {
      // Si on a déjà une extraction pour cette année, on garde la plus récente
      // (l'ordre n'est pas garanti, donc on écrase simplement)
      extractionsByYear.set(annee, extraction.donnees as ExtractionData)
    }
  }

  // Si aucune année définie, on utilise la première extraction disponible
  if (extractionsByYear.size === 0) {
    const extractionData = extractions[0].donnees as ExtractionData
    const ratios = calculateRatios(extractionData)
    const valeurs = extractValues(extractionData)
    const score = calculateScore(ratios, valeurs)

    return {
      success: true,
      score,
      extractionData,
      anneesDisponibles: [],
      hasValidatedData: true,
    }
  }

  // Trier les années et identifier N, N-1, N-2
  const annees = Array.from(extractionsByYear.keys()).sort((a, b) => b - a)
  const anneeN = annees[0] // Année la plus récente
  const anneeN1 = annees.find((a) => a === anneeN - 1)
  const anneeN2 = annees.find((a) => a === anneeN - 2)

  const donneesN = extractionsByYear.get(anneeN)!
  const donneesN1 = anneeN1 ? extractionsByYear.get(anneeN1) : undefined
  const donneesN2 = anneeN2 ? extractionsByYear.get(anneeN2) : undefined

  // Calculer les ratios avec les données multi-années (pour le score principal)
  const ratios = calculateRatios(donneesN, donneesN1, donneesN2)
  const valeursN = extractValues(donneesN)

  // Calculer le score principal (en passant les données pour filtrer les ratios non pertinents)
  const score = calculateScore(ratios, valeursN)

  // Calculer les scores individuels pour chaque année (pour comparaison inter-années)
  // Ces scores sont calculés SANS évolutions pour une comparaison équitable
  const scoresParAnnee: YearScore[] = []

  // Score année N - SANS évolution pour comparaison juste entre années
  const ratiosN = calculateRatios(donneesN) // Sans N-1, N-2
  scoresParAnnee.push({
    annee: anneeN,
    score: calculateScore(ratiosN, valeursN), // Score isolé
    extractionData: donneesN,
  })

  // Score année N-1 si disponible
  if (donneesN1 && anneeN1) {
    const ratiosN1 = calculateRatios(donneesN1)
    const valeursN1 = extractValues(donneesN1)
    scoresParAnnee.push({
      annee: anneeN1,
      score: calculateScore(ratiosN1, valeursN1),
      extractionData: donneesN1,
    })
  }

  // Score année N-2 si disponible
  if (donneesN2 && anneeN2) {
    const ratiosN2 = calculateRatios(donneesN2)
    const valeursN2 = extractValues(donneesN2)
    scoresParAnnee.push({
      annee: anneeN2,
      score: calculateScore(ratiosN2, valeursN2),
      extractionData: donneesN2,
    })
  }

  // Trier par année croissante pour l'affichage
  scoresParAnnee.sort((a, b) => a.annee - b.annee)

  // Sauvegarder le score dans l'historique si demandé
  let savedToHistory = false
  if (saveToHistory) {
    savedToHistory = await saveOrUpdateScoreHistory(supabase, enterpriseId, anneeN, score)

    // Mettre à jour le statut du dossier à "analyse" si ce n'est pas déjà le cas
    if (savedToHistory && enterprise.statut !== 'analyse') {
      await updateEnterpriseStatus(supabase, enterpriseId)
    }
  }

  return {
    success: true,
    score,
    extractionData: donneesN,
    anneesDisponibles: annees,
    scoresParAnnee,
    hasValidatedData: true,
    savedToHistory,
  }
}
