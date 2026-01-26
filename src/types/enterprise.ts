export type EnterpriseStatus = 'brouillon' | 'documents_uploades' | 'extrait' | 'valide' | 'analyse'

export interface Enterprise {
  id: string
  created_at: string
  user_id: string
  siren: string | null
  siret: string | null
  raison_sociale: string | null
  forme_juridique: string | null
  code_naf: string | null
  adresse: string | null
  statut: EnterpriseStatus

  // Champs INPI - Identité enrichie
  nom_commercial?: string | null
  sigle?: string | null
  nic_siege?: string | null
  date_immatriculation?: string | null
  date_debut_activite?: string | null
  date_fin_existence?: string | null
  date_creation?: string | null
  code_forme_juridique?: string | null
  duree_societe?: number | null

  // Champs INPI - Description
  objet_social?: string | null

  // Champs INPI - Capital
  capital?: number | null
  devise_capital?: string | null
  capital_variable?: boolean | null

  // Champs INPI - Caractéristiques
  ess?: boolean | null
  societe_mission?: boolean | null
  origine_fusion_scission?: boolean | null
  associe_unique?: boolean | null
  associe_unique_dirigeant?: boolean | null
  societe_etrangere?: boolean | null
  micro_entreprise?: boolean | null
  etablie_en_france?: boolean | null
  salaries_en_france?: boolean | null
  entreprise_agricole?: boolean | null
  reliee_entreprise_agricole?: boolean | null
  eirl?: boolean | null
  type_personne?: string | null

  // Champs INPI - Adresse siège
  code_postal?: string | null
  ville?: string | null
  code_pays?: string | null
  code_insee_commune?: string | null
  type_voie?: string | null
  libelle_voie?: string | null
  num_voie?: string | null
  indice_repetition?: string | null
  distribution_speciale?: string | null
  complement_localisation?: string | null
  ambulant?: boolean | null
  domiciliataire?: boolean | null

  // Champs INPI - Établissement principal
  siret_siege?: string | null
  code_ape_siege?: string | null
  activite_non_sedentaire?: boolean | null

  // Champs INPI - Diffusion
  diffusion_insee?: string | null
  diffusion_commerciale?: boolean | null

  // Champs INPI - Registres
  inscrit_raa?: boolean | null
  inscrit_rnm?: boolean | null
  inscrit_rncs?: boolean | null
  date_inscription_rncs?: string | null

  // Champs INPI - Métadonnées
  inpi_id?: string | null
  inpi_updated_at?: string | null
  inpi_sync_at?: string | null
  date_cloture_exercice?: string | null
  date_premiere_cloture?: string | null
  nombre_representants_actifs?: number | null
  nombre_etablissements_ouverts?: number | null

  // Champs INSEE/SIRENE - Métadonnées
  insee_sync_at?: string | null

  // Enrichissement automatique
  enrichissement_status?: EnrichmentStatus | null

  // Soft delete
  deleted_at?: string | null
  deleted_by?: string | null

  // Creator info
  created_by_email?: string | null
}

export type EnrichmentStatus = 'pending' | 'in_progress' | 'completed' | 'partial' | 'failed'

export interface CreateEnterpriseData {
  siren: string
  siret?: string
  raison_sociale: string
  forme_juridique?: string
  code_naf?: string
  adresse?: string
}

export interface UpdateEnterpriseData {
  raison_sociale?: string
  siret?: string
  code_naf?: string
  adresse?: string
  ville?: string
  code_postal?: string
}

export const STATUT_LABELS: Record<EnterpriseStatus, string> = {
  brouillon: 'Brouillon',
  documents_uploades: 'Documents uploadés',
  extrait: 'Extrait',
  valide: 'Validé',
  analyse: 'Analysé',
}

export const STATUT_COLORS: Record<EnterpriseStatus, string> = {
  brouillon: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  documents_uploades: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  extrait: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  valide: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  analyse: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}
