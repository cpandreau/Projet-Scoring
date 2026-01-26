'use server'

import { comparerAuSecteur, type SectorComparisonResult } from '@/lib/api/sector-comparison'
import type { ScoreResult } from '@/lib/ratios'
import { getEnterpriseById } from '@/repositories/enterprise.repository'
import type { ExtractionData } from '@/schemas/extraction.schema'
import { calculateEnterpriseScore, type YearScore } from './score.actions'

// --- Types internes ---

interface RatiosExtractionResult {
  ratios: Record<string, number | null>
  chiffreAffaires: number
}

// --- Helper functions pour réduire la complexité cognitive ---

function createEmptyResult(
  codeNaf: string,
  anneesDisponibles: number[],
  error: string
): SectorComparisonResult {
  return {
    classeNaf: codeNaf,
    classeCA: '',
    exerciceEntreprise: 0,
    exerciceSecteur: '',
    cohorte: 0,
    anneesDisponibles,
    comparisons: [],
    loading: false,
    error,
  }
}

function extractChiffreAffaires(caField: ExtractionData['chiffre_affaires'] | undefined): number {
  if (!caField) return 0
  if (typeof caField === 'number') return caField
  if (typeof caField === 'object' && 'valeur' in caField) {
    return caField.valeur ?? 0
  }
  return 0
}

function extractRatiosFromScore(score: ScoreResult): Record<string, number | null> {
  const ratios: Record<string, number | null> = {}
  for (const [ratioId, detail] of Object.entries(score.detailRatios)) {
    ratios[ratioId] = detail.valeur
  }
  return ratios
}

function getRatiosForYear(
  scoreAnnee: YearScore | undefined,
  fallbackScore: ScoreResult,
  fallbackExtraction: ExtractionData | undefined
): RatiosExtractionResult {
  if (scoreAnnee) {
    return {
      ratios: extractRatiosFromScore(scoreAnnee.score),
      chiffreAffaires: extractChiffreAffaires(scoreAnnee.extractionData?.chiffre_affaires),
    }
  }

  return {
    ratios: extractRatiosFromScore(fallbackScore),
    chiffreAffaires: extractChiffreAffaires(fallbackExtraction?.chiffre_affaires),
  }
}

function determineAnneeSelectionnee(
  anneeExercice: number | undefined,
  anneesDisponibles: number[]
): number {
  if (anneeExercice && anneesDisponibles.includes(anneeExercice)) {
    return anneeExercice
  }
  return anneesDisponibles[0] || new Date().getFullYear() - 1
}

// --- Action principale simplifiée ---

export async function getSectorComparison(
  enterpriseId: string,
  anneeExercice?: number
): Promise<SectorComparisonResult | null> {
  try {
    const enterprise = await getEnterpriseById(enterpriseId)
    if (!enterprise) {
      console.error('[SectorComparison] Enterprise not found')
      return null
    }

    if (!enterprise.code_naf) {
      return createEmptyResult('', [], 'Code NAF non renseigné pour cette entreprise')
    }

    const scoreResult = await calculateEnterpriseScore(enterpriseId, {
      saveToHistory: false,
    })

    const anneesDisponibles = scoreResult.anneesDisponibles || []

    if (!scoreResult.success || !scoreResult.score) {
      return createEmptyResult(
        enterprise.code_naf,
        anneesDisponibles,
        "Impossible de calculer les ratios de l'entreprise"
      )
    }

    const anneeSelectionnee = determineAnneeSelectionnee(anneeExercice, anneesDisponibles)

    const scoreAnnee = scoreResult.scoresParAnnee?.find((s) => s.annee === anneeSelectionnee)

    const { ratios, chiffreAffaires } = getRatiosForYear(
      scoreAnnee,
      scoreResult.score,
      scoreResult.extractionData
    )

    return await comparerAuSecteur(
      ratios,
      enterprise.code_naf,
      chiffreAffaires,
      anneeSelectionnee,
      anneesDisponibles
    )
  } catch (error) {
    console.error('[SectorComparison] Error:', error)
    return null
  }
}
