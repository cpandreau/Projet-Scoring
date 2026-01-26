export interface Localisation {
  region: { code: string; nom: string }
  departement: { code: string; nom: string; population?: number }
  commune?: { code: string; nom: string }
  zoneEmploi?: { code: string; nom: string }
}

export interface SecteurActivite {
  codeNAF: string // Ex: "4120A"
  libelleNAF: string
  codeA21?: string // Ex: "FZ"
  libelleA21?: string // Ex: "Construction"
}

/** Données de créations par année */
export interface CreationsParAnnee {
  annee: number
  creations: number
}

/** Indicateurs de santé du secteur */
export type SanteSecteur = 'dynamique' | 'stable' | 'difficulte'
export type TendanceSecteur = 'croissance' | 'stable' | 'declin'

/** Démographie entreprises (créations/cessations) au niveau régional */
export interface DemographieEntreprises {
  annee: number
  creations: number
  cessations: number
  transfertsEntrants: number
  transfertsSortants: number
  soldeNet: number
  tauxCessation?: number // cessations / stock * 100
}

/** Effectifs salariés du secteur */
export interface EffectifsSecteur {
  annee: number
  effectifTotal: number
  nombreEtablissements: number
  effectifMoyen?: number // effectifTotal / nombreEtablissements
}

/** Contexte économique local */
export interface ContexteEconomique {
  tauxChomage?: number // en %
  anneeChomage?: number
  revenuMedian?: number // en euros
  anneeRevenu?: number
  pibRegional?: number // en millions d'euros
  anneePib?: number
}

export interface IndicateursTerritoriaux {
  // Données de base
  nbEntreprisesSecteur?: number
  creationsAnnee?: number
  evolutionCreations?: number
  defaillancesAnnee?: number
  evolutionDefaillances?: number
  tauxChomage?: number
  revenusMedians?: number

  // Données enrichies
  historiqueCreations?: CreationsParAnnee[]
  totalEntreprisesDepartement?: number
  partSecteur?: number // % du secteur dans le département
  densitePour10000?: number // Entreprises du secteur pour 10 000 habitants
  moyenneNationaleCreations?: number // Pour comparaison

  // Indicateurs synthétiques
  santeSecteur?: SanteSecteur
  tendanceSecteur?: TendanceSecteur

  // Nouvelles données INSEE
  codeRegion?: string
  nomRegion?: string
  demographieRegion?: DemographieEntreprises
  effectifsSecteur?: EffectifsSecteur
  contexteEconomique?: ContexteEconomique
}

export interface TerritorialContext {
  localisation: Localisation
  secteur: SecteurActivite
  indicateurs: IndicateursTerritoriaux
  sources: Array<{ nom: string; dateMAJ: string }>
  dateCalcul: string
}
