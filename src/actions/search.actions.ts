'use server'

import { createClient } from '@/lib/supabase/server'
import type { EnterpriseWithScore } from '@/repositories/enterprise.repository'

/**
 * Recherche les entreprises par SIREN ou raison sociale
 * Retourne les 10 premiers résultats avec leur score
 */
export async function searchEnterprises(query: string): Promise<EnterpriseWithScore[]> {
  if (!query || query.length < 2) return []

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // Nettoyer la query
  const cleanQuery = query.trim()

  // Recherche par SIREN (exact ou partiel) ou raison sociale (ilike)
  const { data: enterprises, error } = await supabase
    .from('dossiers')
    .select('*')
    .is('deleted_at', null)
    .or(`siren.ilike.%${cleanQuery}%,raison_sociale.ilike.%${cleanQuery}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !enterprises) {
    console.error('Error searching enterprises:', error)
    return []
  }

  // Récupérer les scores pour les entreprises analysées
  const analyzedIds = enterprises.filter((e) => e.statut === 'analyse').map((e) => e.id)

  const scoresMap = new Map<string, number>()

  if (analyzedIds.length > 0) {
    const { data: extractions, error: extractionsError } = await supabase
      .from('donnees_extraites')
      .select('donnees, documents!inner(dossier_id, annee_exercice)')
      .eq('is_validated', true)
      .in('documents.dossier_id', analyzedIds)

    if (!extractionsError && extractions && extractions.length > 0) {
      const { calculateRatios, calculateScore } = await import('@/lib/ratios')

      // Grouper par entreprise et garder l'année la plus récente
      const latestByEnterprise = new Map<string, { donnees: unknown; annee: number }>()

      for (const extraction of extractions) {
        const doc = extraction.documents as unknown as {
          dossier_id: string
          annee_exercice: number | null
        }
        const dossierId = doc.dossier_id
        const annee = doc.annee_exercice ?? 0

        const existing = latestByEnterprise.get(dossierId)
        if (!existing || annee > existing.annee) {
          latestByEnterprise.set(dossierId, { donnees: extraction.donnees, annee })
        }
      }

      // Calculer les scores
      const { extractValues } = await import('@/schemas/extraction.schema')
      for (const [dossierId, { donnees }] of latestByEnterprise) {
        try {
          const extractionData = donnees as Parameters<typeof calculateRatios>[0]
          const ratios = calculateRatios(extractionData)
          const valeurs = extractValues(extractionData)
          const scoreResult = calculateScore(ratios, valeurs)
          scoresMap.set(dossierId, scoreResult.scoreGlobal)
        } catch (error) {
          console.error('Error calculating score for search:', error)
        }
      }
    }
  }

  // Combiner entreprises avec scores
  return enterprises.map((enterprise) => ({
    ...enterprise,
    score: scoresMap.get(enterprise.id) ?? null,
  })) as EnterpriseWithScore[]
}
