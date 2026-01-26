import type { EnterpriseScoreResult } from '@/actions/score.actions'
import type { TerritorialContext } from '@/types/territorial'

/**
 * Génère les insights textuels à partir des données territoriales et du score
 */
export function generateInsights(
  data: TerritorialContext,
  scoreResult: EnterpriseScoreResult,
  nomDepartement: string
): string[] {
  const insights: string[] = []
  const { indicateurs } = data

  // Score insight
  if (scoreResult.score) {
    const score = scoreResult.score.scoreGlobal
    if (score >= 7) {
      insights.push('Bonne santé financière selon les ratios analysés')
    } else if (score < 4) {
      insights.push('Attention : indicateurs financiers à surveiller')
    }
  }

  // Sector health insight
  if (indicateurs.santeSecteur === 'dynamique') {
    insights.push(`Secteur très dynamique dans ${nomDepartement}`)
  } else if (indicateurs.santeSecteur === 'difficulte') {
    insights.push(`Attention : secteur en difficulté dans ${nomDepartement}`)
  }

  // Regional demography insight (tous secteurs confondus) - seulement si données complètes
  if (indicateurs.demographieRegion && indicateurs.demographieRegion.cessations > 0) {
    const ratio = indicateurs.demographieRegion.creations / indicateurs.demographieRegion.cessations
    if (ratio > 1.2) {
      insights.push(
        `Dynamique régionale positive : ${ratio.toFixed(1)}x plus de créations que de cessations`
      )
    } else if (ratio < 0.8) {
      insights.push(`Plus de cessations que de créations au niveau régional`)
    }
  }

  // Evolution insight
  if (indicateurs.evolutionCreations !== undefined) {
    if (indicateurs.evolutionCreations > 10) {
      insights.push(
        `Fort dynamisme : +${indicateurs.evolutionCreations.toFixed(1)}% de créations vs N-1`
      )
    } else if (indicateurs.evolutionCreations < -10) {
      insights.push(
        `Ralentissement notable : ${indicateurs.evolutionCreations.toFixed(1)}% de créations vs N-1`
      )
    }
  }

  // Economic context insight
  if (indicateurs.contexteEconomique?.tauxChomage !== undefined) {
    if (indicateurs.contexteEconomique.tauxChomage > 10) {
      insights.push(
        `Zone à fort taux de chômage (${indicateurs.contexteEconomique.tauxChomage.toFixed(1)}%)`
      )
    } else if (indicateurs.contexteEconomique.tauxChomage < 6) {
      insights.push(
        `Zone à faible taux de chômage (${indicateurs.contexteEconomique.tauxChomage.toFixed(1)}%)`
      )
    }
  }

  // Density insight
  if (indicateurs.densitePour10000 !== undefined) {
    if (indicateurs.densitePour10000 > 50) {
      insights.push(
        `Forte densité d'entreprises du secteur (${indicateurs.densitePour10000}/10 000 hab.)`
      )
    } else if (indicateurs.densitePour10000 < 10) {
      insights.push(
        `Faible densité d'entreprises du secteur (${indicateurs.densitePour10000}/10 000 hab.)`
      )
    }
  }

  // Trend insight
  if (indicateurs.tendanceSecteur === 'croissance') {
    insights.push('Tendance de fond positive sur les 5 dernières années')
  } else if (indicateurs.tendanceSecteur === 'declin') {
    insights.push('Tendance de fond négative sur les 5 dernières années')
  }

  // Effectifs insight
  if (indicateurs.effectifsSecteur?.effectifMoyen !== undefined) {
    if (indicateurs.effectifsSecteur.effectifMoyen < 3) {
      insights.push('Secteur dominé par les très petites entreprises (TPE)')
    } else if (indicateurs.effectifsSecteur.effectifMoyen > 20) {
      insights.push('Secteur avec des établissements de taille significative')
    }
  }

  return insights.slice(0, 5)
}
