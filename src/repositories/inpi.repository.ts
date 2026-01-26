import { createClient } from '@/lib/supabase/server'

// Types pour les tables liées INPI (correspondant aux colonnes réelles de la DB)
export interface DossierDirigeant {
  id: string
  dossier_id: string
  role_code: string | null
  role_libelle: string | null
  type_personne: 'INDIVIDU' | 'PERSONNE_MORALE'
  nom: string
  prenoms: string | null
  date_naissance: string | null
  nationalite: string | null
  commune_domicile: string | null
  code_postal_domicile: string | null
  siren_pm: string | null
  actif: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface DossierActivite {
  id: string
  dossier_id: string
  category_code: string | null
  activite_id: string | null
  principale: boolean | null
  date_debut: string | null
  date_fin: string | null
  exercice_activite: string | null
  forme_exercice: string | null
  description_detaillee: string | null
  code_ape: string | null
  created_at: string | null
}

export interface DossierObservation {
  id: string
  dossier_id: string
  id_observation: number | null
  num_observation: string | null
  date_ajout: string | null
  texte: string | null
  date_greffe: string | null
  etat: string | null
  code_observation: string | null
  is_procedure_collective: boolean | null
  type_procedure: string | null
  created_at: string | null
}

export interface DossierHistorique {
  id: string
  dossier_id: string
  date_evenement: string | null
  code_evenement: string | null
  libelle_evenement: string | null
  created_at: string | null
}

// Fonctions de récupération des données

export async function getDossierDirigeants(dossierId: string): Promise<DossierDirigeant[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dossier_dirigeants')
    .select('*')
    .eq('dossier_id', dossierId)
    .eq('actif', true)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching dossier dirigeants:', error.message || error)
    return []
  }

  return (data || []) as DossierDirigeant[]
}

export async function getDossierActivites(dossierId: string): Promise<DossierActivite[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dossier_activites')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('principale', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching dossier activites:', error.message || error)
    return []
  }

  return (data || []) as DossierActivite[]
}

export async function getDossierObservations(dossierId: string): Promise<DossierObservation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dossier_observations')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('date_ajout', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching dossier observations:', error.message || error)
    return []
  }

  return (data || []) as DossierObservation[]
}

export async function getDossierHistorique(dossierId: string): Promise<DossierHistorique[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dossier_historique')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('date_evenement', { ascending: false })
    .limit(200)

  if (error) {
    console.error('Error fetching dossier historique:', error.message || error)
    return []
  }

  return (data || []) as DossierHistorique[]
}

// Interface pour les données INPI complètes
export interface DossierINPIData {
  dirigeants: DossierDirigeant[]
  activites: DossierActivite[]
  observations: DossierObservation[]
  historique: DossierHistorique[]
}

// Fonction pour récupérer toutes les données INPI d'un dossier
export async function getDossierINPIData(dossierId: string): Promise<DossierINPIData> {
  const [dirigeants, activites, observations, historique] = await Promise.all([
    getDossierDirigeants(dossierId),
    getDossierActivites(dossierId),
    getDossierObservations(dossierId),
    getDossierHistorique(dossierId),
  ])

  return {
    dirigeants,
    activites,
    observations,
    historique,
  }
}
