'use server'

import { type FamilyId, RATIO_FAMILIES, RATIOS } from '@/config/ratios.config'
import { generateScoreReport, type ReportData } from '@/lib/pdf/generate-score-report'
import type { ScoreResult } from '@/lib/ratios'
import { getEnterpriseById } from '@/repositories/enterprise.repository'
import type { Enterprise } from '@/types'
import { calculateEnterpriseScore } from './score.actions'

// --- Helper functions pour réduire la complexité cognitive ---

function buildRatiosForReport(score: ScoreResult): ReportData['ratios'] {
  const ratios: ReportData['ratios'] = []

  for (const [ratioKey, ratioDetail] of Object.entries(score.detailRatios)) {
    const ratioConfig = RATIOS[ratioKey]
    if (!ratioConfig) continue

    const familyConfig = RATIO_FAMILIES[ratioConfig.famille as FamilyId]

    ratios.push({
      famille: familyConfig?.nom || ratioConfig.famille,
      nom: ratioDetail.nom,
      valeur: ratioDetail.valeur,
      unite: ratioConfig.unite,
      zone: ratioDetail.zone,
    })
  }

  return ratios
}

function buildReportData(
  enterprise: Enterprise,
  score: ScoreResult,
  anneeExercice: number
): ReportData {
  return {
    enterprise: {
      nom: enterprise.raison_sociale || 'Sans nom',
      siren: enterprise.siren || undefined,
      formeJuridique: enterprise.forme_juridique || undefined,
    },
    anneeExercice,
    dateCalcul: new Date().toLocaleDateString('fr-FR'),
    score: {
      global: score.scoreGlobal,
      liquidite: score.scoreParFamille.liquidite?.score ?? null,
      rentabilite: score.scoreParFamille.rentabilite?.score ?? null,
      solvabilite: score.scoreParFamille.solvabilite?.score ?? null,
      activite: score.scoreParFamille.activite?.score ?? null,
      evolution: score.scoreParFamille.evolution?.score ?? null,
    },
    ratios: buildRatiosForReport(score),
  }
}

function generateFilename(raisonSociale: string | null, annee: number): string {
  const safeName = (raisonSociale || 'entreprise').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)
  return `rapport-score-${safeName}-${annee}.pdf`
}

// --- Action principale simplifiée ---

export async function generateScoreReportPDF(enterpriseId: string): Promise<{
  success: boolean
  data?: string
  filename?: string
  error?: string
}> {
  try {
    const enterprise = await getEnterpriseById(enterpriseId)
    if (!enterprise) {
      return { success: false, error: 'Entreprise non trouvée' }
    }

    const scoreResult = await calculateEnterpriseScore(enterpriseId, {
      saveToHistory: false,
    })

    if (!scoreResult.success || !scoreResult.score) {
      return {
        success: false,
        error: scoreResult.error || 'Erreur de calcul du score',
      }
    }

    const { score, anneesDisponibles } = scoreResult
    const anneeExercice = anneesDisponibles?.[0] ?? new Date().getFullYear()

    const reportData = buildReportData(enterprise, score, anneeExercice)
    const pdfBytes = await generateScoreReport(reportData)
    const base64Pdf = Buffer.from(pdfBytes).toString('base64')

    return {
      success: true,
      data: base64Pdf,
      filename: generateFilename(enterprise.raison_sociale, anneeExercice),
    }
  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return {
      success: false,
      error: 'Erreur lors de la génération du PDF',
    }
  }
}
