import type { RatioDetail } from '@/actions/dirigeant-dashboard.actions'

export interface Recommandation {
  titre: string
  description: string
  priorite: 'haute' | 'moyenne'
  icone: string
}

/**
 * Mapping des codes ratios vers leurs recommandations
 */
const RECOMMANDATIONS_MAP: Record<string, { titre: string; description: string }> = {
  // Liquidite
  liquidite_generale: {
    titre: 'Renforcer votre tresorerie',
    description:
      'Votre capacite a couvrir vos dettes court terme est faible. Envisagez de negocier vos delais fournisseurs ou accelerer vos encaissements.',
  },
  liquidite_immediate: {
    titre: 'Constituer une reserve',
    description:
      'Votre tresorerie immediate est tendue. Visez un mois de charges en reserve.',
  },
  couverture_bfr: {
    titre: 'Equilibrer votre BFR',
    description:
      'Votre besoin en fonds de roulement est insuffisamment couvert. Optimisez votre cycle.',
  },

  // Delais
  delai_clients: {
    titre: 'Reduire vos delais clients',
    description:
      'Vos clients mettent trop de temps a payer. Relancez plus tot ou proposez un escompte.',
  },
  delai_fournisseurs: {
    titre: 'Surveiller vos fournisseurs',
    description:
      'Vos delais fournisseurs sont eleves. Attention aux tensions relationnelles.',
  },
  rotation_stocks: {
    titre: 'Optimiser vos stocks',
    description:
      'Votre rotation de stocks est lente. Reduisez les stocks dormants pour liberer de la tresorerie.',
  },

  // Solvabilite
  taux_endettement: {
    titre: 'Maitriser votre endettement',
    description: 'Votre niveau de dettes est eleve. Limitez les nouveaux emprunts.',
  },
  capacite_remboursement: {
    titre: 'Alleger la dette',
    description:
      'Votre capacite de remboursement est tendue. Renegociez vos echeances si possible.',
  },
  autonomie_financiere: {
    titre: 'Renforcer vos fonds propres',
    description:
      'Votre autonomie financiere est faible. Envisagez de renforcer vos capitaux propres.',
  },
  equilibre_global: {
    titre: 'Reequilibrer votre bilan',
    description:
      'Votre equilibre financier est fragile. Vos ressources stables ne couvrent pas assez vos emplois durables.',
  },
  poids_decouvert: {
    titre: 'Reduire le decouvert',
    description:
      'Le decouvert pese trop dans votre dette. Negociez une ligne de credit plus adaptee.',
  },

  // Rentabilite
  taux_rentabilite_financiere: {
    titre: 'Ameliorer la rentabilite',
    description: 'Votre rentabilite est faible. Travaillez vos marges ou reduisez les couts.',
  },
  rentabilite_economique: {
    titre: 'Optimiser vos actifs',
    description:
      'Votre rentabilite economique est insuffisante. Vos actifs ne generent pas assez de valeur.',
  },
  rentabilite_commerciale: {
    titre: 'Ameliorer vos marges',
    description:
      'Votre resultat net est faible par rapport a votre CA. Analysez vos postes de couts.',
  },
  taux_marge_brute: {
    titre: 'Proteger vos marges',
    description: 'Votre marge brute recule. Revoyez vos prix ou vos achats.',
  },
  taux_marge_industrielle: {
    titre: 'Optimiser la production',
    description:
      'Votre marge industrielle est faible. Reduisez vos couts de production ou renegociez vos achats.',
  },
  taux_marge_commerciale: {
    titre: 'Ameliorer la marge commerciale',
    description:
      'Votre marge commerciale est insuffisante. Revoyez votre politique de prix ou de sourcing.',
  },
  charges_personnel_va: {
    titre: 'Optimiser la productivite',
    description: 'La masse salariale pese lourd. Cherchez des gains de productivite.',
  },
  charges_financieres_va: {
    titre: 'Reduire les charges financieres',
    description:
      'Vos charges financieres sont elevees. Renegociez vos taux ou remboursez par anticipation.',
  },
  impots_taxes_va: {
    titre: 'Optimiser la fiscalite',
    description:
      'Le poids fiscal est important. Verifiez vos options legales.',
  },

  // Activite
  ratio_fonds_roulement: {
    titre: 'Renforcer le fonds de roulement',
    description:
      'Votre fonds de roulement est insuffisant. Augmentez vos ressources stables.',
  },
  cash_flow_exploitation: {
    titre: 'Ameliorer le cash-flow',
    description:
      'Votre exploitation genere peu de cash. Optimisez votre cycle de conversion.',
  },

  // Evolution CA
  variation_ca_n1: {
    titre: 'Relancer votre activite',
    description:
      'Votre chiffre d\'affaires baisse sur 1 an. Analysez les causes et adaptez votre offre.',
  },
  variation_ca_n2: {
    titre: 'Inverser la tendance',
    description:
      'Votre CA recule depuis 2 ans. Une action commerciale forte est necessaire.',
  },

  // Evolution VA
  variation_va_n1: {
    titre: 'Creer plus de valeur',
    description:
      'Votre valeur ajoutee diminue. Ameliorez votre mix produit ou reduisez vos consommations.',
  },
  variation_va_n2: {
    titre: 'Redresser la creation de valeur',
    description:
      'La valeur ajoutee recule depuis 2 ans. Revoyez votre modele economique.',
  },

  // Evolution resultat
  variation_resultat_n1: {
    titre: 'Redresser le resultat',
    description:
      'Votre resultat baisse sur 1 an. Identifiez les postes de charges a optimiser.',
  },
  variation_resultat_n2: {
    titre: 'Retablir la rentabilite',
    description:
      'Votre resultat se degrade depuis 2 ans. Un plan d\'action est urgent.',
  },

  // Evolution marges
  variation_marge_brute_n1: {
    titre: 'Stopper l\'erosion des marges',
    description: 'Votre marge brute recule. Agissez sur vos prix ou vos charges.',
  },
  variation_marge_brute_n2: {
    titre: 'Reconstruire vos marges',
    description:
      'Vos marges s\'erodent depuis 2 ans. Une revision strategique est necessaire.',
  },
  variation_marge_commerciale_n1: {
    titre: 'Preserver la marge commerciale',
    description: 'Votre marge commerciale baisse. Revoyez votre politique tarifaire.',
  },
  variation_marge_commerciale_n2: {
    titre: 'Restaurer la marge commerciale',
    description:
      'La marge commerciale se degrade depuis 2 ans. Analysez votre positionnement.',
  },

  // Evolution charges
  variation_charges_personnel_va_n1: {
    titre: 'Maitriser les charges de personnel',
    description:
      'Le poids des salaires augmente. Verifiez l\'adequation effectifs/activite.',
  },
  variation_charges_personnel_va_n2: {
    titre: 'Reequilibrer la masse salariale',
    description:
      'Les charges de personnel derivent depuis 2 ans. Une reorganisation peut etre necessaire.',
  },
  variation_charges_financieres_va_n1: {
    titre: 'Contenir les charges financieres',
    description: 'Vos charges financieres augmentent. Limitez le recours a l\'emprunt.',
  },
  variation_charges_financieres_va_n2: {
    titre: 'Reduire le cout de la dette',
    description:
      'Les charges financieres s\'alourdissent depuis 2 ans. Renegociez vos conditions.',
  },
  variation_impots_va_n1: {
    titre: 'Anticiper la charge fiscale',
    description:
      'Le poids fiscal augmente. Provisionnez et optimisez votre situation fiscale.',
  },
  variation_impots_va_n2: {
    titre: 'Revoir la strategie fiscale',
    description:
      'La pression fiscale augmente depuis 2 ans. Consultez un expert-comptable.',
  },

  // Evolution stocks
  variation_rotation_stocks_n1: {
    titre: 'Accelerer la rotation',
    description: 'Vos stocks tournent moins vite. Identifiez les produits dormants.',
  },
  variation_rotation_stocks_n2: {
    titre: 'Destocker les invendus',
    description:
      'La rotation ralentit depuis 2 ans. Un destockage ou des promotions peuvent aider.',
  },
}

/**
 * Genere des recommandations basees sur les points d'attention
 * @param pointsAttention - Ratios en zone rouge ou jaune (deja tries par gravite)
 * @returns Maximum 3 recommandations uniques
 */
export function getRecommandations(pointsAttention: RatioDetail[]): Recommandation[] {
  const recommandations: Recommandation[] = []
  const titresVus = new Set<string>()

  for (const ratio of pointsAttention) {
    // Stop si on a deja 3 recommandations
    if (recommandations.length >= 3) break

    // Chercher une recommandation pour ce ratio
    const recoData = RECOMMANDATIONS_MAP[ratio.code]
    if (!recoData) continue

    // Eviter les doublons (meme titre)
    if (titresVus.has(recoData.titre)) continue
    titresVus.add(recoData.titre)

    recommandations.push({
      titre: recoData.titre,
      description: recoData.description,
      priorite: ratio.zone === 'rouge' ? 'haute' : 'moyenne',
      icone: ratio.zone === 'rouge' ? '🔴' : '🟡',
    })
  }

  return recommandations
}
