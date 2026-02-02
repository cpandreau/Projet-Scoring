/**
 * Service pour récupérer les données officielles via l'API Annuaire Entreprises
 * Source: https://annuaire-entreprises.data.gouv.fr
 *
 * API publique, pas de clé requise, rate-limit généreux
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AnnuaireEntreprise {
  siren: string
  nom_complet: string
  nom_raison_sociale: string
  sigle: string | null
  nature_juridique: string
  activite_principale: string
  date_creation: string
  date_mise_a_jour: string
  etat_administratif: 'A' | 'C' // A = Actif, C = Cessé
  statut_diffusion: 'O' | 'P' // O = Ouvert, P = Partiel (non diffusible)
  categorie_entreprise: string | null // TPE, PME, ETI, GE

  // Effectifs
  tranche_effectif_salarie: string
  annee_tranche_effectif_salarie: string

  // Siège
  siege: {
    siret: string
    adresse: string
    code_postal: string
    libelle_commune: string
    departement: string
    region: string
    latitude: string
    longitude: string
    liste_idcc: string[]
    // Noms commerciaux et enseignes
    nom_commercial?: string | null
    liste_enseignes?: string[] | null
  }

  // Dirigeants
  dirigeants: Array<{
    nom: string
    prenoms: string
    qualite: string
    annee_de_naissance?: string
    type_dirigeant: 'personne physique' | 'personne morale'
    denomination?: string // Pour personnes morales
    siren?: string // Pour personnes morales
  }>

  // Finances (clé = année)
  finances?: Record<
    string,
    {
      ca?: number
      resultat_net?: number
    }
  >

  // Compléments (certifications, etc.)
  complements: {
    convention_collective_renseignee: boolean
    liste_idcc: string[]
    est_bio: boolean
    est_rge: boolean
    est_qualiopi: boolean
    est_ess: boolean
    est_association: boolean
    est_societe_mission: boolean
    egapro_renseignee: boolean
  }
}

interface SearchResult {
  results: AnnuaireEntreprise[]
  total_results: number
  page: number
  per_page: number
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = 'https://recherche-entreprises.api.gouv.fr'

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Search enterprise by SIREN
 */
export async function fetchEntrepriseBySiren(siren: string): Promise<AnnuaireEntreprise | null> {
  if (!siren || siren.length !== 9) {
    console.warn(`[Annuaire] Invalid SIREN: ${siren}`)
    return null
  }

  try {
    const response = await fetch(`${BASE_URL}/search?q=${siren}&mtm_campaign=defaillantometre`, {
      next: { revalidate: 86400 }, // Cache 24h
    })

    if (!response.ok) {
      console.error(`[Annuaire] API error: ${response.status}`)
      return null
    }

    const data: SearchResult = await response.json()

    // Trouver l'entreprise exacte par SIREN
    const enterprise = data.results?.find((r) => r.siren === siren)

    if (!enterprise) {
      console.log(`[Annuaire] No result for SIREN ${siren}`)
      return null
    }

    console.log(`[Annuaire] Found enterprise: ${enterprise.nom_complet}`)
    return enterprise
  } catch (error) {
    console.error('[Annuaire] Fetch error:', error)
    return null
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format tranche effectif for display
 */
export function formatTrancheEffectif(tranche: string | undefined): string {
  if (!tranche) return 'Non renseigné'

  const tranches: Record<string, string> = {
    '00': 'Unité non employeuse',
    '01': '1 à 2 salariés',
    '02': '3 à 5 salariés',
    '03': '6 à 9 salariés',
    '11': '10 à 19 salariés',
    '12': '20 à 49 salariés',
    '21': '50 à 99 salariés',
    '22': '100 à 199 salariés',
    '31': '200 à 249 salariés',
    '32': '250 à 499 salariés',
    '41': '500 à 999 salariés',
    '42': '1 000 à 1 999 salariés',
    '51': '2 000 à 4 999 salariés',
    '52': '5 000 à 9 999 salariés',
    '53': '10 000 salariés et plus',
  }
  return tranches[tranche] || tranche || 'Non renseigné'
}

/**
 * Get etat administratif label
 */
export function formatEtatAdministratif(etat: 'A' | 'C'): {
  label: string
  variant: 'default' | 'destructive'
} {
  return etat === 'A'
    ? { label: 'Entreprise active', variant: 'default' }
    : { label: 'Entreprise cessée', variant: 'destructive' }
}

/**
 * Get convention collective title from IDCC code
 */
export function getConventionCollectiveTitle(idcc: string): string {
  // Mapping des IDCC les plus courants
  const idccMap: Record<string, string> = {
    '1486': "Bureaux d'études techniques (Syntec)",
    '1518': 'Animation',
    '1527': 'Immobilier',
    '1596': 'Bâtiment (ouvriers)',
    '1597': 'Bâtiment (ETAM)',
    '1702': 'Travaux publics (ouvriers)',
    '2098': 'Prêt-à-porter',
    '2111': 'Salariés du particulier employeur',
    '2120': 'Banque',
    '2148': 'Télécommunications',
    '2216': 'Commerce de détail et de gros à prédominance alimentaire',
    '2264': 'Hospitalisation privée',
    '2941': 'Aide à domicile',
    '3127': 'Entreprises de services à la personne',
    '44': 'Industries chimiques',
    '45': 'Caoutchouc',
    '66': 'Travaux publics (ETAM)',
    '87': 'Architecte',
    '176': 'Industrie pharmaceutique',
  }

  return idccMap[idcc] || `Convention collective IDCC ${idcc}`
}

/**
 * Format finances for display
 */
export function getLatestFinances(finances: AnnuaireEntreprise['finances']): {
  annee: string
  ca: number | null
  resultat_net: number | null
} | null {
  if (!finances) return null

  const years = Object.keys(finances).sort((a, b) => Number(b) - Number(a))
  const latestYear = years[0]

  if (!latestYear) return null

  return {
    annee: latestYear,
    ca: finances[latestYear].ca ?? null,
    resultat_net: finances[latestYear].resultat_net ?? null,
  }
}

/**
 * Format category label
 */
export function formatCategorieEntreprise(categorie: string | null): string {
  const categories: Record<string, string> = {
    TPE: 'Très petite entreprise',
    PME: 'Petite ou moyenne entreprise',
    ETI: 'Entreprise de taille intermédiaire',
    GE: 'Grande entreprise',
  }
  return categorie ? categories[categorie] || categorie : 'Non renseigné'
}

/**
 * Extrait tous les noms utilisables pour la recherche
 * (raison sociale, enseigne, nom commercial, sigle)
 */
export function extractAllNames(data: AnnuaireEntreprise): string[] {
  const names = new Set<string>()

  // Raison sociale complète
  if (data.nom_complet) {
    names.add(data.nom_complet)

    // Extraire le nom entre parenthèses si présent (ex: "SARL SODICMA (FRANPRIX)")
    const parenthesesMatch = data.nom_complet.match(/\(([^)]+)\)/)
    if (parenthesesMatch?.[1]) {
      names.add(parenthesesMatch[1])
    }
  }

  // Raison sociale simple (si différente)
  if (data.nom_raison_sociale && data.nom_raison_sociale !== data.nom_complet) {
    names.add(data.nom_raison_sociale)
  }

  // Sigle (souvent une abréviation connue)
  if (data.sigle) {
    names.add(data.sigle)
  }

  // Nom commercial du siège
  if (data.siege?.nom_commercial) {
    names.add(data.siege.nom_commercial)
  }

  // Liste des enseignes
  if (data.siege?.liste_enseignes?.length) {
    data.siege.liste_enseignes.forEach((enseigne) => {
      if (enseigne) names.add(enseigne)
    })
  }

  // Filtrer les noms trop courts (< 3 caractères) ou formes juridiques seules
  const formsToExclude = ['SAS', 'SARL', 'SA', 'EURL', 'SCI', 'SASU', 'SNC', 'SELARL']

  return Array.from(names).filter((name) => {
    if (!name || name.length < 3) return false
    // Exclure si c'est juste une forme juridique
    if (formsToExclude.includes(name.toUpperCase())) return false
    return true
  })
}

/**
 * Extrait le nom du dirigeant principal (personne physique)
 */
export function extractMainDirectorName(data: AnnuaireEntreprise): string | null {
  if (!data.dirigeants?.length) return null

  // Chercher le premier dirigeant personne physique
  const physicalPerson = data.dirigeants.find((d) => d.type_dirigeant === 'personne physique')

  if (physicalPerson?.nom && physicalPerson?.prenoms) {
    return `${physicalPerson.prenoms} ${physicalPerson.nom}`
  }

  return null
}
