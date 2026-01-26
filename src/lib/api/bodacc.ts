/**
 * Service pour récupérer les procédures collectives via l'API BODACC (Open Data)
 *
 * Documentation : https://bodacc-datadila.opendatasoft.com/explore/dataset/annonces-commerciales/api/
 * Rate limit : Aucune limite stricte (API ouverte)
 * Authentification : Aucune
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = 'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1'
const DATASET = 'annonces-commerciales'
const REQUEST_TIMEOUT_MS = 15000
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 heure
const CACHE_MAX_ENTRIES = 200

// Code familleavis pour les procédures collectives
const FAMILLE_COLLECTIVE = 'collective'

// ============================================================================
// TYPES
// ============================================================================

/** Types de procédures collectives */
export type TypeProcedure =
  | 'Liquidation judiciaire'
  | 'Redressement judiciaire'
  | 'Sauvegarde'
  | 'Plan de sauvegarde'
  | 'Plan de redressement'
  | 'Clôture'
  | 'Autre'

/** Une procédure collective issue du BODACC */
export interface ProcedureCollective {
  /** Date de parution au BODACC */
  dateParution: string
  /** Date du jugement */
  dateJugement: string | null
  /** Type de procédure (liquidation, redressement, sauvegarde...) */
  typeProcedure: TypeProcedure
  /** Tribunal ayant rendu le jugement */
  tribunal: string | null
  /** Nature du jugement (ouverture, conversion, clôture...) */
  natureJugement: string | null
  /** Numéro d'annonce BODACC */
  numeroAnnonce: string | null
  /** Dénomination de l'entreprise */
  denomination: string | null
  /** Complément du jugement (détails) */
  complementJugement: string | null
  /** URL vers l'annonce complète */
  urlAnnonce: string | null
}

/** Statistiques des procédures par département */
export interface StatistiquesProcedures {
  /** Nombre total de procédures */
  total: number
  /** Nombre de liquidations judiciaires */
  liquidations: number
  /** Nombre de redressements judiciaires */
  redressements: number
  /** Nombre de sauvegardes */
  sauvegardes: number
  /** Année des statistiques */
  annee: number
  /** Code département */
  codeDepartement: string
}

/** Structure du JSON jugement dans les enregistrements BODACC */
interface JugementData {
  famille?: string
  nature?: string
  date?: string
  complementJugement?: string
  type?: string
}

/** Structure d'un enregistrement BODACC */
interface BodaccRecord {
  id?: string
  dateparution?: string
  jugement?: string // JSON stringifié
  familleavis?: string
  tribunal?: string
  numerodepartement?: string
  registre?: string[] // Tableau avec SIREN formaté et non formaté
  numeroannonce?: number
  publicationavis?: string
  commercant?: string
  ville?: string
  cp?: string
  url_complete?: string
}

/** Réponse de l'API BODACC */
interface BodaccApiResponse {
  total_count: number
  results: BodaccRecord[]
}

// ============================================================================
// CACHE EN MÉMOIRE
// ============================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCacheKey(endpoint: string, params: Record<string, string | number>): string {
  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `bodacc:${endpoint}:${paramStr}`
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

function setInCache<T>(key: string, data: T): void {
  // Nettoyer le cache si trop d'entrées
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }

  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Parse le champ jugement JSON
 */
function parseJugement(jugementStr: string | undefined): JugementData | null {
  if (!jugementStr) return null

  try {
    return JSON.parse(jugementStr) as JugementData
  } catch {
    console.warn('[BODACC] Erreur parsing jugement JSON')
    return null
  }
}

/**
 * Détermine le type de procédure à partir du jugement
 */
function parseTypeProcedure(jugement: JugementData | null): TypeProcedure {
  if (!jugement) return 'Autre'

  const nature = (jugement.nature || '').toLowerCase()
  const complement = (jugement.complementJugement || '').toLowerCase()
  const text = `${nature} ${complement}`

  if (text.includes('liquidation judiciaire')) {
    return 'Liquidation judiciaire'
  }
  if (text.includes('redressement judiciaire')) {
    return 'Redressement judiciaire'
  }
  if (text.includes('plan de sauvegarde')) {
    return 'Plan de sauvegarde'
  }
  if (text.includes('sauvegarde')) {
    return 'Sauvegarde'
  }
  if (text.includes('plan de redressement')) {
    return 'Plan de redressement'
  }
  if (text.includes('clôture') || text.includes('cloture')) {
    return 'Clôture'
  }

  return 'Autre'
}

/**
 * Convertit une date française "10 décembre 2009" en ISO "2009-12-10"
 */
function parseDateFrancaise(dateFr: string | undefined): string | null {
  if (!dateFr) return null

  const moisMap: Record<string, string> = {
    janvier: '01',
    février: '02',
    fevrier: '02',
    mars: '03',
    avril: '04',
    mai: '05',
    juin: '06',
    juillet: '07',
    août: '08',
    aout: '08',
    septembre: '09',
    octobre: '10',
    novembre: '11',
    décembre: '12',
    decembre: '12',
  }

  // Pattern : "10 décembre 2009"
  const match = dateFr.toLowerCase().match(/(\d{1,2})\s+(\w+)\s+(\d{4})/)

  if (match) {
    const [, jour, moisStr, annee] = match
    const mois = moisMap[moisStr]
    if (mois) {
      return `${annee}-${mois}-${jour.padStart(2, '0')}`
    }
  }

  // Fallback : pattern JJ/MM/AAAA
  const matchSlash = dateFr.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (matchSlash) {
    const [, jour, mois, annee] = matchSlash
    return `${annee}-${mois}-${jour}`
  }

  return null
}

/**
 * Effectue une requête vers l'API BODACC
 */
async function fetchBodacc(
  where: string,
  limit: number = 100,
  offset: number = 0
): Promise<BodaccApiResponse | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const params = new URLSearchParams({
    where,
    limit: limit.toString(),
    offset: offset.toString(),
    order_by: 'dateparution DESC',
  })

  const url = `${API_BASE_URL}/catalog/datasets/${DATASET}/records?${params}`

  try {
    console.log(`[BODACC] Fetching: ${url}`)

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[BODACC] Erreur HTTP ${response.status}`)
      return null
    }

    const data: BodaccApiResponse = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[BODACC] Timeout après 15s')
    } else {
      console.error('[BODACC] Erreur réseau:', error)
    }

    return null
  }
}

/**
 * Convertit un enregistrement BODACC en ProcedureCollective
 */
function recordToProcedure(record: BodaccRecord): ProcedureCollective {
  const jugement = parseJugement(record.jugement)

  return {
    dateParution: record.dateparution || '',
    dateJugement: parseDateFrancaise(jugement?.date),
    typeProcedure: parseTypeProcedure(jugement),
    tribunal: record.tribunal || null,
    natureJugement: jugement?.nature || null,
    numeroAnnonce: record.numeroannonce?.toString() || null,
    denomination: record.commercant || null,
    complementJugement: jugement?.complementJugement || null,
    urlAnnonce: record.url_complete || null,
  }
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Recherche les procédures collectives pour un SIREN donné
 *
 * @param siren - Numéro SIREN de l'entreprise (9 chiffres)
 * @returns Liste des procédures collectives ou tableau vide si aucune
 *
 * @example
 * ```ts
 * const procedures = await getProceduresBySiren("316962380");
 * console.log(procedures);
 * // [{ dateParution: "2009-11-08", typeProcedure: "Liquidation judiciaire", ... }]
 * ```
 */
export async function getProceduresBySiren(siren: string): Promise<ProcedureCollective[]> {
  // Valider le SIREN
  const sirenClean = siren.replace(/\s/g, '')
  if (!/^\d{9}$/.test(sirenClean)) {
    console.warn(`[BODACC] SIREN invalide: ${siren}`)
    return []
  }

  console.log(`[BODACC] Recherche SIREN ${sirenClean}`)

  const cacheKey = getCacheKey('procedures', { siren: sirenClean })

  // Vérifier le cache
  const cached = getFromCache<ProcedureCollective[]>(cacheKey)
  if (cached !== null) {
    console.log(`[BODACC] Cache hit: ${cacheKey}`)
    return cached
  }

  // Construire la requête
  // Le champ registre est un tableau, on peut chercher directement par valeur
  const where = `registre="${sirenClean}" AND familleavis="${FAMILLE_COLLECTIVE}"`

  const response = await fetchBodacc(where, 100)
  if (!response) {
    return []
  }

  const procedures = response.results.map(recordToProcedure)

  console.log(`[BODACC] ${procedures.length} procédures trouvées`)

  // Mettre en cache
  setInCache(cacheKey, procedures)

  return procedures
}

/**
 * Récupère les statistiques des procédures collectives par département et année
 *
 * @param codeDepartement - Code département (ex: "58" pour la Nièvre)
 * @param annee - Année des statistiques
 * @returns Statistiques agrégées ou null si erreur
 *
 * @example
 * ```ts
 * const stats = await getStatistiquesProceduresDepartement("58", 2024);
 * console.log(stats);
 * // { total: 120, liquidations: 80, redressements: 30, sauvegardes: 10, annee: 2024, codeDepartement: "58" }
 * ```
 */
export async function getStatistiquesProceduresDepartement(
  codeDepartement: string,
  annee: number
): Promise<StatistiquesProcedures | null> {
  // Valider le code département
  const depClean = codeDepartement.replace(/\s/g, '').padStart(2, '0')
  if (!/^\d{2,3}$/.test(depClean)) {
    console.warn(`[BODACC] Code département invalide: ${codeDepartement}`)
    return null
  }

  console.log(`[BODACC] Statistiques département ${depClean} pour l'année ${annee}`)

  const cacheKey = getCacheKey('stats', {
    departement: depClean,
    annee,
  })

  // Vérifier le cache
  const cached = getFromCache<StatistiquesProcedures>(cacheKey)
  if (cached !== null) {
    console.log(`[BODACC] Cache hit: ${cacheKey}`)
    return cached
  }

  // Construire la requête pour l'année complète
  const dateDebut = `${annee}-01-01`
  const dateFin = `${annee}-12-31`
  const where = `numerodepartement="${depClean}" AND dateparution>="${dateDebut}" AND dateparution<="${dateFin}" AND familleavis="${FAMILLE_COLLECTIVE}"`

  // Récupérer toutes les procédures pour compter par type
  // On fait plusieurs requêtes si nécessaire (pagination)
  let allRecords: BodaccRecord[] = []
  let offset = 0
  const limit = 100
  let totalCount = 0

  do {
    const response = await fetchBodacc(where, limit, offset)
    if (!response) {
      break
    }

    totalCount = response.total_count
    allRecords = [...allRecords, ...response.results]
    offset += limit

    // Limiter à 1000 enregistrements pour éviter trop de requêtes
    if (offset >= 1000) {
      console.warn(
        `[BODACC] Limite de pagination atteinte (1000 records), total réel: ${totalCount}`
      )
      break
    }
  } while (offset < totalCount)

  console.log(
    `[BODACC] ${allRecords.length} procédures récupérées pour ${depClean}/${annee} (total API: ${totalCount})`
  )

  // Compter par type
  let liquidations = 0
  let redressements = 0
  let sauvegardes = 0

  for (const record of allRecords) {
    const jugement = parseJugement(record.jugement)
    const type = parseTypeProcedure(jugement)
    switch (type) {
      case 'Liquidation judiciaire':
        liquidations++
        break
      case 'Redressement judiciaire':
      case 'Plan de redressement':
        redressements++
        break
      case 'Sauvegarde':
      case 'Plan de sauvegarde':
        sauvegardes++
        break
    }
  }

  const stats: StatistiquesProcedures = {
    total: allRecords.length,
    liquidations,
    redressements,
    sauvegardes,
    annee,
    codeDepartement: depClean,
  }

  console.log(
    `[BODACC] Stats ${depClean}/${annee}: total=${stats.total}, liquidations=${stats.liquidations}, redressements=${stats.redressements}, sauvegardes=${stats.sauvegardes}`
  )

  // Mettre en cache
  setInCache(cacheKey, stats)

  return stats
}

/**
 * Vérifie si une entreprise a des procédures collectives en cours
 *
 * @param siren - Numéro SIREN de l'entreprise
 * @returns true si au moins une procédure est en cours
 */
export async function hasProceduresEnCours(siren: string): Promise<boolean> {
  const procedures = await getProceduresBySiren(siren)

  // Une procédure est "en cours" si ce n'est pas une clôture
  return procedures.some((p) => p.typeProcedure !== 'Clôture')
}

/**
 * Récupère la dernière procédure collective d'une entreprise
 *
 * @param siren - Numéro SIREN de l'entreprise
 * @returns La procédure la plus récente ou null si aucune
 */
export async function getDerniereProcedure(siren: string): Promise<ProcedureCollective | null> {
  const procedures = await getProceduresBySiren(siren)

  if (procedures.length === 0) {
    return null
  }

  // Les procédures sont déjà triées par date de parution décroissante
  return procedures[0]
}

// ============================================================================
// UTILITAIRES PUBLICS
// ============================================================================

/**
 * Vide le cache BODACC (utile pour les tests)
 */
export function clearCache(): void {
  cache.clear()
  console.log('[BODACC] Cache vidé')
}

/**
 * Retourne les statistiques du cache
 */
export function getCacheStats(): { size: number; maxSize: number } {
  return {
    size: cache.size,
    maxSize: CACHE_MAX_ENTRIES,
  }
}
