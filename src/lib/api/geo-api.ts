/**
 * Service pour récupérer les données géographiques et de population via l'API Geo
 *
 * Documentation : https://geo.api.gouv.fr/decoupage-administratif
 * Rate limit : Aucune limite stricte (API ouverte)
 * Authentification : Aucune
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = 'https://geo.api.gouv.fr'
const REQUEST_TIMEOUT_MS = 10000
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 heures (données stables)
const CACHE_MAX_ENTRIES = 500

// ============================================================================
// TYPES
// ============================================================================

/** Informations sur un département */
export interface Departement {
  code: string
  nom: string
  codeRegion: string
}

/** Population d'un département */
export interface PopulationDepartement {
  population: number
  nbCommunes: number
  codeDepartement: string
  nomDepartement: string
}

/** Informations sur une commune */
export interface Commune {
  code: string
  nom: string
  codeDepartement: string
  codeRegion: string
  population: number
  codesPostaux: string[]
}

/** Commune simplifiée (résultat de recherche) */
export interface CommuneSimple {
  code: string
  nom: string
  population: number
}

/** Structure d'une commune dans la réponse API */
interface CommuneApiResponse {
  code: string
  nom: string
  codeDepartement?: string
  codeRegion?: string
  population?: number
  codesPostaux?: string[]
}

/** Structure d'un département dans la réponse API */
interface DepartementApiResponse {
  code: string
  nom: string
  codeRegion?: string
}

// ============================================================================
// CACHE EN MÉMOIRE
// ============================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCacheKey(endpoint: string, params?: Record<string, string | number>): string {
  if (!params) return `geo:${endpoint}`
  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `geo:${endpoint}:${paramStr}`
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
// UTILITAIRES HTTP
// ============================================================================

async function fetchGeoApi<T>(endpoint: string): Promise<T | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const url = `${API_BASE_URL}${endpoint}`

  try {
    console.log(`[Geo API] Fetching: ${url}`)

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 404) {
      console.log('[Geo API] 404 - Ressource non trouvée')
      return null
    }

    if (!response.ok) {
      console.error(`[Geo API] Erreur HTTP ${response.status}`)
      return null
    }

    const data: T = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Geo API] Timeout après 10s')
    } else {
      console.error('[Geo API] Erreur réseau:', error)
    }

    return null
  }
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Récupère les informations d'un département
 *
 * @param codeDepartement - Code du département (ex: "58", "75", "2A")
 * @returns Informations du département ou null si non trouvé
 *
 * @example
 * ```ts
 * const dept = await getDepartement("58");
 * console.log(dept);
 * // { code: "58", nom: "Nièvre", codeRegion: "27" }
 * ```
 */
export async function getDepartement(codeDepartement: string): Promise<Departement | null> {
  const code = codeDepartement.trim().toUpperCase()

  console.log(`[Geo API] Recherche département ${code}`)

  const cacheKey = getCacheKey(`departement:${code}`)

  // Vérifier le cache
  const cached = getFromCache<Departement>(cacheKey)
  if (cached !== null) {
    console.log(`[Geo API] Cache hit: ${cacheKey}`)
    return cached
  }

  const endpoint = `/departements/${code}?fields=nom,code,codeRegion`
  const data = await fetchGeoApi<DepartementApiResponse>(endpoint)

  if (!data) {
    return null
  }

  const departement: Departement = {
    code: data.code,
    nom: data.nom,
    codeRegion: data.codeRegion || '',
  }

  console.log(`[Geo API] Département trouvé: ${departement.nom}`)

  setInCache(cacheKey, departement)
  return departement
}

/**
 * Calcule la population totale d'un département en sommant les populations des communes
 *
 * @param codeDepartement - Code du département (ex: "58", "75")
 * @returns Population et nombre de communes ou null si erreur
 *
 * @example
 * ```ts
 * const pop = await getPopulationDepartement("58");
 * console.log(pop);
 * // { population: 203695, nbCommunes: 309, codeDepartement: "58", nomDepartement: "Nièvre" }
 * ```
 */
export async function getPopulationDepartement(
  codeDepartement: string
): Promise<PopulationDepartement | null> {
  const code = codeDepartement.trim().toUpperCase()

  console.log(`[Geo API] Calcul population département ${code}`)

  const cacheKey = getCacheKey(`population:${code}`)

  // Vérifier le cache
  const cached = getFromCache<PopulationDepartement>(cacheKey)
  if (cached !== null) {
    console.log(`[Geo API] Cache hit: ${cacheKey}`)
    return cached
  }

  // Récupérer d'abord les infos du département
  const departement = await getDepartement(code)
  if (!departement) {
    console.warn(`[Geo API] Département ${code} non trouvé`)
    return null
  }

  // Récupérer toutes les communes du département
  const endpoint = `/departements/${code}/communes?fields=population`
  const communes = await fetchGeoApi<CommuneApiResponse[]>(endpoint)

  if (!communes || communes.length === 0) {
    console.warn(`[Geo API] Aucune commune trouvée pour le département ${code}`)
    return null
  }

  // Calculer la somme des populations
  const population = communes.reduce((sum, commune) => sum + (commune.population || 0), 0)

  const result: PopulationDepartement = {
    population,
    nbCommunes: communes.length,
    codeDepartement: code,
    nomDepartement: departement.nom,
  }

  console.log(
    `[Geo API] Population ${departement.nom}: ${population.toLocaleString('fr-FR')} habitants (${communes.length} communes)`
  )

  setInCache(cacheKey, result)
  return result
}

/**
 * Récupère les informations d'une commune par son code INSEE
 *
 * @param codeCommune - Code INSEE de la commune (ex: "75056" pour Paris)
 * @returns Informations de la commune ou null si non trouvée
 *
 * @example
 * ```ts
 * const commune = await getCommune("75056");
 * console.log(commune);
 * // { code: "75056", nom: "Paris", population: 2145906, ... }
 * ```
 */
export async function getCommune(codeCommune: string): Promise<Commune | null> {
  const code = codeCommune.trim()

  console.log(`[Geo API] Recherche commune ${code}`)

  const cacheKey = getCacheKey(`commune:${code}`)

  // Vérifier le cache
  const cached = getFromCache<Commune>(cacheKey)
  if (cached !== null) {
    console.log(`[Geo API] Cache hit: ${cacheKey}`)
    return cached
  }

  const endpoint = `/communes/${code}?fields=nom,code,codeDepartement,codeRegion,population,codesPostaux`
  const data = await fetchGeoApi<CommuneApiResponse>(endpoint)

  if (!data) {
    return null
  }

  const commune: Commune = {
    code: data.code,
    nom: data.nom,
    codeDepartement: data.codeDepartement || '',
    codeRegion: data.codeRegion || '',
    population: data.population || 0,
    codesPostaux: data.codesPostaux || [],
  }

  console.log(
    `[Geo API] Commune trouvée: ${commune.nom} (${commune.population.toLocaleString('fr-FR')} hab.)`
  )

  setInCache(cacheKey, commune)
  return commune
}

/**
 * Recherche les communes correspondant à un code postal
 *
 * @param codePostal - Code postal (ex: "75001", "58000")
 * @returns Liste des communes correspondantes ou tableau vide
 *
 * @example
 * ```ts
 * const communes = await getCommuneByCodePostal("58000");
 * console.log(communes);
 * // [{ code: "58194", nom: "Nevers", population: 32854 }]
 * ```
 */
export async function getCommuneByCodePostal(codePostal: string): Promise<CommuneSimple[]> {
  const cp = codePostal.trim()

  if (!/^\d{5}$/.test(cp)) {
    console.warn(`[Geo API] Code postal invalide: ${codePostal}`)
    return []
  }

  console.log(`[Geo API] Recherche communes pour code postal ${cp}`)

  const cacheKey = getCacheKey(`codepostal:${cp}`)

  // Vérifier le cache
  const cached = getFromCache<CommuneSimple[]>(cacheKey)
  if (cached !== null) {
    console.log(`[Geo API] Cache hit: ${cacheKey}`)
    return cached
  }

  const endpoint = `/communes?codePostal=${cp}&fields=nom,code,population`
  const data = await fetchGeoApi<CommuneApiResponse[]>(endpoint)

  if (!data || data.length === 0) {
    console.log(`[Geo API] Aucune commune pour le code postal ${cp}`)
    return []
  }

  const communes: CommuneSimple[] = data.map((c) => ({
    code: c.code,
    nom: c.nom,
    population: c.population || 0,
  }))

  console.log(`[Geo API] ${communes.length} commune(s) trouvée(s) pour ${cp}`)

  setInCache(cacheKey, communes)
  return communes
}

/**
 * Récupère les informations d'une région
 *
 * @param codeRegion - Code de la région (ex: "27" pour Bourgogne-Franche-Comté)
 * @returns Informations de la région ou null si non trouvée
 */
export async function getRegion(codeRegion: string): Promise<{ code: string; nom: string } | null> {
  const code = codeRegion.trim()

  console.log(`[Geo API] Recherche région ${code}`)

  const cacheKey = getCacheKey(`region:${code}`)

  // Vérifier le cache
  const cached = getFromCache<{ code: string; nom: string }>(cacheKey)
  if (cached !== null) {
    console.log(`[Geo API] Cache hit: ${cacheKey}`)
    return cached
  }

  const endpoint = `/regions/${code}?fields=nom,code`
  const data = await fetchGeoApi<{ code: string; nom: string }>(endpoint)

  if (!data) {
    return null
  }

  console.log(`[Geo API] Région trouvée: ${data.nom}`)

  setInCache(cacheKey, data)
  return data
}

/**
 * Récupère les départements d'une région
 *
 * @param codeRegion - Code de la région
 * @returns Liste des départements de la région
 */
export async function getDepartementsByRegion(codeRegion: string): Promise<Departement[]> {
  const code = codeRegion.trim()

  console.log(`[Geo API] Recherche départements de la région ${code}`)

  const cacheKey = getCacheKey(`region-deps:${code}`)

  // Vérifier le cache
  const cached = getFromCache<Departement[]>(cacheKey)
  if (cached !== null) {
    console.log(`[Geo API] Cache hit: ${cacheKey}`)
    return cached
  }

  const endpoint = `/regions/${code}/departements?fields=nom,code,codeRegion`
  const data = await fetchGeoApi<DepartementApiResponse[]>(endpoint)

  if (!data || data.length === 0) {
    console.log(`[Geo API] Aucun département pour la région ${code}`)
    return []
  }

  const departements: Departement[] = data.map((d) => ({
    code: d.code,
    nom: d.nom,
    codeRegion: d.codeRegion || code,
  }))

  console.log(`[Geo API] ${departements.length} département(s) dans la région ${code}`)

  setInCache(cacheKey, departements)
  return departements
}

// ============================================================================
// UTILITAIRES PUBLICS
// ============================================================================

/**
 * Vide le cache Geo API (utile pour les tests)
 */
export function clearCache(): void {
  cache.clear()
  console.log('[Geo API] Cache vidé')
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
