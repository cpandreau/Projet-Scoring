/**
 * Service pour récupérer les données de fiscalité locale des entreprises
 *
 * Documentation : https://data.economie.gouv.fr/explore/dataset/fiscalite-locale-des-entreprises/api/
 * Rate limit : Aucune limite stricte (API ouverte)
 * Authentification : Aucune
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = 'https://data.economie.gouv.fr/api/explore/v2.1'
const DATASET = 'fiscalite-locale-des-entreprises'
const REQUEST_TIMEOUT_MS = 15000
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 heures
const CACHE_MAX_ENTRIES = 300

// ============================================================================
// TYPES
// ============================================================================

/** Données de fiscalité locale d'une commune */
export interface FiscaliteLocale {
  codeCommune: string
  nomCommune: string
  codeDepartement: string
  nomDepartement: string
  annee: number
  /** Cotisation Foncière des Entreprises (%) */
  tauxCFE: number
  /** Taxe Foncière sur les Propriétés Bâties (%) */
  tauxTFPB: number
  /** Taxe Foncière sur les Propriétés Non Bâties (%) */
  tauxTFNB: number | null
  /** Taxe d'Enlèvement des Ordures Ménagères (%) */
  tauxTEOM: number | null
}

/** Moyenne de la fiscalité sur un département */
export interface FiscaliteMoyenne {
  codeDepartement: string
  nomDepartement: string
  annee: number
  /** Moyenne CFE (%) */
  moyenneCFE: number
  /** Moyenne TFPB (%) */
  moyenneTFPB: number
  /** Moyenne TFNB (%) */
  moyenneTFNB: number | null
  /** Moyenne TEOM (%) */
  moyenneTEOM: number | null
  /** Nombre de communes dans le calcul */
  nbCommunes: number
}

/** Comparaison fiscalité commune vs département */
export interface ComparaisonFiscalite {
  commune: FiscaliteLocale
  moyenneDept: FiscaliteMoyenne
  /** Écart CFE (commune - moyenne), positif = plus cher */
  ecartCFE: number
  /** Écart TFPB (commune - moyenne), positif = plus cher */
  ecartTFPB: number
  /** Écart en pourcentage relatif CFE */
  ecartCFEPourcent: number
  /** Écart en pourcentage relatif TFPB */
  ecartTFPBPourcent: number
}

/** Structure d'un enregistrement de l'API */
interface FiscaliteRecord {
  exercice?: string
  dep?: string
  libdep?: string
  insee_com?: string
  libcom?: string
  taux_global_cfe_hz?: number | null
  taux_global_tfb?: number | null
  taux_global_tfnb?: number | null
  taux_plein_teom?: number | null
}

/** Réponse de l'API */
interface FiscaliteApiResponse {
  total_count: number
  results: FiscaliteRecord[]
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
  return `fiscalite:${endpoint}:${paramStr}`
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

async function fetchFiscaliteApi(
  where: string,
  orderBy: string = 'exercice DESC',
  limit: number = 100,
  offset: number = 0
): Promise<FiscaliteApiResponse | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const params = new URLSearchParams({
    where,
    order_by: orderBy,
    limit: limit.toString(),
    offset: offset.toString(),
  })

  const url = `${API_BASE_URL}/catalog/datasets/${DATASET}/records?${params}`

  try {
    console.log(`[Fiscalité] Fetching: ${url}`)

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[Fiscalité] Erreur HTTP ${response.status}`)
      return null
    }

    const data: FiscaliteApiResponse = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Fiscalité] Timeout après 15s')
    } else {
      console.error('[Fiscalité] Erreur réseau:', error)
    }

    return null
  }
}

/**
 * Convertit un enregistrement API en FiscaliteLocale
 */
function recordToFiscalite(record: FiscaliteRecord): FiscaliteLocale {
  return {
    codeCommune: record.insee_com || '',
    nomCommune: record.libcom || '',
    codeDepartement: record.dep || '',
    nomDepartement: record.libdep || '',
    annee: parseInt(record.exercice || '0', 10),
    tauxCFE: record.taux_global_cfe_hz ?? 0,
    tauxTFPB: record.taux_global_tfb ?? 0,
    tauxTFNB: record.taux_global_tfnb ?? null,
    tauxTEOM: record.taux_plein_teom ?? null,
  }
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Récupère la fiscalité locale d'une commune
 *
 * @param codeCommune - Code INSEE de la commune (ex: "58194" pour Nevers)
 * @returns Données de fiscalité ou null si non trouvé
 *
 * @example
 * ```ts
 * const fiscalite = await getFiscaliteCommune("58194");
 * console.log(fiscalite);
 * // { codeCommune: "58194", nomCommune: "NEVERS", tauxCFE: 28.0, tauxTFPB: 55.98, ... }
 * ```
 */
export async function getFiscaliteCommune(codeCommune: string): Promise<FiscaliteLocale | null> {
  const code = codeCommune.trim()

  console.log(`[Fiscalité] Recherche commune ${code}`)

  const cacheKey = getCacheKey('commune', { code })

  // Vérifier le cache
  const cached = getFromCache<FiscaliteLocale>(cacheKey)
  if (cached !== null) {
    console.log(`[Fiscalité] Cache hit: ${cacheKey}`)
    return cached
  }

  const where = `insee_com="${code}"`
  const response = await fetchFiscaliteApi(where, 'exercice DESC', 1)

  if (!response || response.results.length === 0) {
    console.log(`[Fiscalité] Aucune donnée pour la commune ${code}`)
    return null
  }

  const fiscalite = recordToFiscalite(response.results[0])

  console.log(
    `[Fiscalité] ${fiscalite.nomCommune}: CFE=${fiscalite.tauxCFE}%, TFPB=${fiscalite.tauxTFPB}%`
  )

  setInCache(cacheKey, fiscalite)
  return fiscalite
}

/**
 * Calcule la moyenne de la fiscalité sur un département
 *
 * @param codeDepartement - Code du département (ex: "58")
 * @param annee - Année (optionnel, dernière année par défaut)
 * @returns Moyennes des taux ou null si erreur
 *
 * @example
 * ```ts
 * const moyenne = await getFiscaliteMoyenneDepartement("58");
 * console.log(moyenne);
 * // { moyenneCFE: 26.5, moyenneTFPB: 45.2, nbCommunes: 309, ... }
 * ```
 */
export async function getFiscaliteMoyenneDepartement(
  codeDepartement: string,
  annee?: number
): Promise<FiscaliteMoyenne | null> {
  const code = codeDepartement.trim().padStart(2, '0')

  console.log(`[Fiscalité] Calcul moyenne département ${code}${annee ? ` (${annee})` : ''}`)

  const cacheKey = getCacheKey('moyenne-dept', {
    code,
    annee: annee || 'latest',
  })

  // Vérifier le cache
  const cached = getFromCache<FiscaliteMoyenne>(cacheKey)
  if (cached !== null) {
    console.log(`[Fiscalité] Cache hit: ${cacheKey}`)
    return cached
  }

  // Si pas d'année spécifiée, récupérer d'abord la dernière année disponible
  let targetYear = annee
  if (!targetYear) {
    const sampleWhere = `dep="${code}"`
    const sampleResponse = await fetchFiscaliteApi(sampleWhere, 'exercice DESC', 1)
    if (sampleResponse && sampleResponse.results.length > 0) {
      targetYear = parseInt(sampleResponse.results[0].exercice || '0', 10)
    }
  }

  if (!targetYear) {
    console.warn(`[Fiscalité] Impossible de déterminer l'année pour le département ${code}`)
    return null
  }

  // Récupérer toutes les communes du département pour cette année
  const where = `dep="${code}" AND exercice="${targetYear}"`
  let allRecords: FiscaliteRecord[] = []
  let offset = 0
  const limit = 100
  let totalCount = 0

  do {
    const response = await fetchFiscaliteApi(where, 'exercice DESC', limit, offset)
    if (!response) {
      break
    }

    totalCount = response.total_count
    allRecords = [...allRecords, ...response.results]
    offset += limit

    // Limiter à 500 communes pour éviter trop de requêtes
    if (offset >= 500) {
      console.warn(`[Fiscalité] Limite pagination atteinte (500), total réel: ${totalCount}`)
      break
    }
  } while (offset < totalCount)

  if (allRecords.length === 0) {
    console.warn(`[Fiscalité] Aucune commune trouvée pour ${code}/${targetYear}`)
    return null
  }

  // Calculer les moyennes
  let sumCFE = 0
  let countCFE = 0
  let sumTFPB = 0
  let countTFPB = 0
  let sumTFNB = 0
  let countTFNB = 0
  let sumTEOM = 0
  let countTEOM = 0
  let nomDepartement = ''

  for (const record of allRecords) {
    if (!nomDepartement && record.libdep) {
      nomDepartement = record.libdep
    }

    if (record.taux_global_cfe_hz != null && record.taux_global_cfe_hz > 0) {
      sumCFE += record.taux_global_cfe_hz
      countCFE++
    }
    if (record.taux_global_tfb != null && record.taux_global_tfb > 0) {
      sumTFPB += record.taux_global_tfb
      countTFPB++
    }
    if (record.taux_global_tfnb != null && record.taux_global_tfnb > 0) {
      sumTFNB += record.taux_global_tfnb
      countTFNB++
    }
    if (record.taux_plein_teom != null && record.taux_plein_teom > 0) {
      sumTEOM += record.taux_plein_teom
      countTEOM++
    }
  }

  const moyenne: FiscaliteMoyenne = {
    codeDepartement: code,
    nomDepartement,
    annee: targetYear,
    moyenneCFE: countCFE > 0 ? Math.round((sumCFE / countCFE) * 100) / 100 : 0,
    moyenneTFPB: countTFPB > 0 ? Math.round((sumTFPB / countTFPB) * 100) / 100 : 0,
    moyenneTFNB: countTFNB > 0 ? Math.round((sumTFNB / countTFNB) * 100) / 100 : null,
    moyenneTEOM: countTEOM > 0 ? Math.round((sumTEOM / countTEOM) * 100) / 100 : null,
    nbCommunes: allRecords.length,
  }

  console.log(
    `[Fiscalité] Moyenne ${nomDepartement} (${targetYear}): CFE=${moyenne.moyenneCFE}%, TFPB=${moyenne.moyenneTFPB}% (${moyenne.nbCommunes} communes)`
  )

  setInCache(cacheKey, moyenne)
  return moyenne
}

/**
 * Compare la fiscalité d'une commune à la moyenne départementale
 *
 * @param codeCommune - Code INSEE de la commune
 * @returns Comparaison avec écarts ou null si erreur
 *
 * @example
 * ```ts
 * const comparaison = await comparerFiscaliteCommune("58194");
 * console.log(comparaison);
 * // { ecartCFE: 1.5, ecartCFEPourcent: 5.7, ... }
 * ```
 */
export async function comparerFiscaliteCommune(
  codeCommune: string
): Promise<ComparaisonFiscalite | null> {
  const code = codeCommune.trim()

  console.log(`[Fiscalité] Comparaison commune ${code}`)

  const cacheKey = getCacheKey('comparaison', { code })

  // Vérifier le cache
  const cached = getFromCache<ComparaisonFiscalite>(cacheKey)
  if (cached !== null) {
    console.log(`[Fiscalité] Cache hit: ${cacheKey}`)
    return cached
  }

  // Récupérer la fiscalité de la commune
  const commune = await getFiscaliteCommune(code)
  if (!commune) {
    console.warn(`[Fiscalité] Commune ${code} non trouvée pour comparaison`)
    return null
  }

  // Récupérer la moyenne du département
  const moyenneDept = await getFiscaliteMoyenneDepartement(commune.codeDepartement, commune.annee)
  if (!moyenneDept) {
    console.warn(`[Fiscalité] Moyenne département ${commune.codeDepartement} non disponible`)
    return null
  }

  // Calculer les écarts
  const ecartCFE = Math.round((commune.tauxCFE - moyenneDept.moyenneCFE) * 100) / 100
  const ecartTFPB = Math.round((commune.tauxTFPB - moyenneDept.moyenneTFPB) * 100) / 100

  const ecartCFEPourcent =
    moyenneDept.moyenneCFE > 0 ? Math.round((ecartCFE / moyenneDept.moyenneCFE) * 10000) / 100 : 0
  const ecartTFPBPourcent =
    moyenneDept.moyenneTFPB > 0
      ? Math.round((ecartTFPB / moyenneDept.moyenneTFPB) * 10000) / 100
      : 0

  const comparaison: ComparaisonFiscalite = {
    commune,
    moyenneDept,
    ecartCFE,
    ecartTFPB,
    ecartCFEPourcent,
    ecartTFPBPourcent,
  }

  const signeCFE = ecartCFE >= 0 ? '+' : ''
  const signeTFPB = ecartTFPB >= 0 ? '+' : ''

  console.log(
    `[Fiscalité] ${commune.nomCommune} vs ${moyenneDept.nomDepartement}: CFE ${signeCFE}${ecartCFE}pts (${signeCFE}${ecartCFEPourcent}%), TFPB ${signeTFPB}${ecartTFPB}pts (${signeTFPB}${ecartTFPBPourcent}%)`
  )

  setInCache(cacheKey, comparaison)
  return comparaison
}

/**
 * Récupère l'historique de la fiscalité d'une commune sur plusieurs années
 *
 * @param codeCommune - Code INSEE de la commune
 * @param nbAnnees - Nombre d'années d'historique (défaut: 5)
 * @returns Liste des données par année, triées de la plus récente à la plus ancienne
 */
export async function getHistoriqueFiscaliteCommune(
  codeCommune: string,
  nbAnnees: number = 5
): Promise<FiscaliteLocale[]> {
  const code = codeCommune.trim()

  console.log(`[Fiscalité] Historique commune ${code} (${nbAnnees} ans)`)

  const cacheKey = getCacheKey('historique', { code, nbAnnees })

  // Vérifier le cache
  const cached = getFromCache<FiscaliteLocale[]>(cacheKey)
  if (cached !== null) {
    console.log(`[Fiscalité] Cache hit: ${cacheKey}`)
    return cached
  }

  const where = `insee_com="${code}"`
  const response = await fetchFiscaliteApi(where, 'exercice DESC', nbAnnees)

  if (!response || response.results.length === 0) {
    console.log(`[Fiscalité] Aucun historique pour la commune ${code}`)
    return []
  }

  const historique = response.results.map(recordToFiscalite)

  console.log(
    `[Fiscalité] Historique ${code}: ${historique.length} années (${historique[historique.length - 1]?.annee}-${historique[0]?.annee})`
  )

  setInCache(cacheKey, historique)
  return historique
}

// ============================================================================
// UTILITAIRES PUBLICS
// ============================================================================

/**
 * Vide le cache fiscalité (utile pour les tests)
 */
export function clearCache(): void {
  cache.clear()
  console.log('[Fiscalité] Cache vidé')
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
