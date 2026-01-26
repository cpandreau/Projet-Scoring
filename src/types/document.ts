export type DocumentType =
  | 'non_classe'
  | 'liasse_fiscale'
  | 'bilan'
  | 'compte_resultat'
  | 'annexes'
  | 'autre'

// Type de liasse fiscale (normale ou simplifiée)
export type TypeLiasse = 'normale' | 'simplifiee'

export interface Document {
  id: string
  created_at: string
  dossier_id: string
  annee_exercice: number | null
  nom_fichier: string
  storage_path: string
  type: DocumentType
  type_liasse: TypeLiasse | null
}

const currentYear = new Date().getFullYear()

export const AVAILABLE_YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i)

// Types disponibles pour la sélection utilisateur (sans non_classe)
export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'liasse_fiscale', label: 'Liasse fiscale (2050-2059)' },
  { value: 'bilan', label: 'Bilan' },
  { value: 'compte_resultat', label: 'Compte de résultat' },
  { value: 'annexes', label: 'Annexes' },
  { value: 'autre', label: 'Autre' },
]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  non_classe: 'Non classé',
  liasse_fiscale: 'Liasse fiscale',
  bilan: 'Bilan',
  compte_resultat: 'Compte de résultat',
  annexes: 'Annexes',
  autre: 'Autre',
}

// Mapping des types vers les noms de dossiers dans le storage
export const DOCUMENT_TYPE_FOLDERS: Record<DocumentType, string> = {
  non_classe: 'non-classe',
  liasse_fiscale: 'liasse-fiscale',
  bilan: 'bilan',
  compte_resultat: 'compte-resultat',
  annexes: 'annexes',
  autre: 'autre',
}

// Type par défaut à l'upload
export const DEFAULT_DOCUMENT_TYPE: DocumentType = 'non_classe'

// Types de liasse fiscale pour la sélection utilisateur
export const TYPE_LIASSE_OPTIONS: { value: TypeLiasse; label: string; description: string }[] = [
  {
    value: 'normale',
    label: 'Normale (2050-2059)',
    description: 'Régime réel normal',
  },
  {
    value: 'simplifiee',
    label: 'Simplifiée (2033)',
    description: 'Régime réel simplifié',
  },
]

export const TYPE_LIASSE_LABELS: Record<TypeLiasse, string> = {
  normale: 'Normale (2050-2059)',
  simplifiee: 'Simplifiée (2033)',
}
