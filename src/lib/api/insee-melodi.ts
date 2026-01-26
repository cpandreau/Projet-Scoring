/**
 * Service pour récupérer les données de démographie des entreprises via l'API INSEE Melodi
 *
 * Documentation : https://api.insee.fr/catalogue/
 * Rate limit : 30 requêtes/minute
 * Authentification : Aucune (API publique)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = 'https://api.insee.fr/melodi'
const REQUEST_TIMEOUT_MS = 10000
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 heures
const CACHE_MAX_ENTRIES = 100
const RETRY_DELAY_MS = 2000
const MAX_RETRIES = 2

// Noms corrects des datasets INSEE Melodi
const DATASETS = {
  CREATIONS: 'DS_SIDE_CREA_DEP_REG_NAT', // Créations d'entreprises par département/région/national
  STOCKS: 'DS_SIDE_STOCKS_A21', // Stock d'entreprises par secteur A21
  // Nouveaux datasets
  DEMOGRAPHIE: 'DS_SIDE_EQDEMO_A21', // Démographie entreprises (créations/cessations)
  EFFECTIFS: 'DS_FLORES_A38', // Effectifs salariés par secteur
  CHOMAGE: 'DS_RP_EMPLOI_LR_PRINC', // Taux de chômage
  REVENUS: 'DS_FILOSOFI_CC', // Revenus médians
  PIB: 'DS_COMPTES_REGIONAUX', // PIB régional
} as const

// Limites d'années disponibles dans l'API
const YEAR_LIMITS = {
  creations: { min: 2012, max: 2024 },
  stocks: { min: 2014, max: 2023 },
} as const

// ============================================================================
// TYPES
// ============================================================================

/** Structure d'une observation dans la réponse Melodi */
export interface MelodiObservationData {
  dimensions: {
    GEO: string
    TIME_PERIOD: string
    ACTIVITY?: string
    LEGAL_FORM?: string
    SIDE_MEASURE?: string
  }
  measures: {
    OBS_VALUE_NIVEAU?: { value: number }
    OBS_VALUE?: number
  }
}

export interface MelodiApiResponse {
  observations: MelodiObservationData[]
  totalCount?: number
  error?: string
}

export interface CreationsEntreprisesData {
  nbCreations: number
  annee: number
  codeGeo: string
  codeActivite: string
}

export interface StockEntreprisesData {
  nbEntreprises: number
  annee: number
  codeGeo: string
  codeActivite: string
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
  return `${endpoint}:${paramStr}`
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
// VALIDATION ET MAPPING
// ============================================================================

/**
 * Valide et ajuste l'année pour qu'elle soit dans les limites disponibles
 */
function validateYear(annee: number, type: 'creations' | 'stocks'): number {
  const limits = YEAR_LIMITS[type]

  if (annee > limits.max) {
    console.warn(
      `[INSEE Melodi] Année ${annee} non disponible pour ${type}, utilisation de ${limits.max}`
    )
    return limits.max
  }
  if (annee < limits.min) {
    console.warn(
      `[INSEE Melodi] Année ${annee} trop ancienne pour ${type}, utilisation de ${limits.min}`
    )
    return limits.min
  }
  return annee
}

/**
 * Convertit un code A21 (ex: "MZ") en code ACTIVITY pour l'API Melodi (ex: "M")
 * L'API utilise uniquement la première lettre du code A21
 */
function codeA21ToActivityCode(codeA21: string): string {
  // Extraire la première lettre du code A21
  // MZ → M, IZ → I, KZ → K, FZ → F, etc.
  return codeA21.charAt(0).toUpperCase()
}

/**
 * Agrège les observations par code activité
 * La réponse contient plusieurs observations par forme juridique, on les somme
 */
function aggregateByActivity(observations: MelodiObservationData[], activityCode: string): number {
  return observations
    .filter((obs) => obs.dimensions.ACTIVITY === activityCode)
    .reduce((sum, obs) => {
      const value = obs.measures.OBS_VALUE_NIVEAU?.value ?? obs.measures.OBS_VALUE ?? 0
      return sum + value
    }, 0)
}

// ============================================================================
// UTILITAIRES HTTP
// ============================================================================

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    console.log(`[INSEE Melodi] Fetching: ${url}`)

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // 404 : données non disponibles
    if (response.status === 404) {
      console.log('[INSEE Melodi] 404 - Données non disponibles')
      return null
    }

    // 429 : rate limit - retry avec backoff
    if (response.status === 429 && retries > 0) {
      const delay = RETRY_DELAY_MS * (MAX_RETRIES - retries + 1)
      console.warn(`[INSEE Melodi] 429 Rate limit - Retry dans ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchWithRetry(url, retries - 1)
    }

    if (!response.ok) {
      console.error(`[INSEE Melodi] Erreur HTTP ${response.status}`)
      return null
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[INSEE Melodi] Timeout après 10s')
    } else {
      console.error('[INSEE Melodi] Erreur réseau:', error)
    }

    return null
  }
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Récupère le nombre de créations d'entreprises pour un département et secteur donnés
 *
 * @param codeDepartement - Code département (ex: "69" pour le Rhône)
 * @param codeA21 - Code secteur A21 (ex: "FZ" pour Construction)
 * @param annee - Année des données (max 2024, défaut 2024)
 * @returns Nombre de créations ou null si non disponible
 */
export async function getCreationsEntreprises(
  codeDepartement: string,
  codeA21: string,
  annee: number = 2024
): Promise<number | null> {
  // Valider et ajuster l'année
  const validYear = validateYear(annee, 'creations')

  // Convertir le code A21 en code activité (première lettre)
  const activityCode = codeA21ToActivityCode(codeA21)
  console.log(`[INSEE Melodi] Mapping A21 "${codeA21}" → ACTIVITY "${activityCode}"`)

  const endpoint = `/data/${DATASETS.CREATIONS}`
  const params = {
    GEO: `DEP-${codeDepartement}`,
    ACTIVITY: activityCode,
    TIME_PERIOD: validYear,
  }

  const cacheKey = getCacheKey(endpoint, params)

  // Vérifier le cache
  const cached = getFromCache<number>(cacheKey)
  if (cached !== null) {
    console.log(`[INSEE Melodi] Cache hit: ${cacheKey}`)
    return cached
  }

  // Construire l'URL - on récupère toutes les données du département/année
  // puis on filtre par activité côté client
  const url = `${API_BASE_URL}${endpoint}?GEO=DEP-${codeDepartement}&TIME_PERIOD=${validYear}`

  const response = await fetchWithRetry(url)
  if (!response) {
    return null
  }

  try {
    const data: MelodiApiResponse = await response.json()

    console.log(`[INSEE Melodi] Réponse créations: ${data.observations?.length ?? 0} observations`)

    if (data.observations && data.observations.length > 0) {
      // Agréger les observations pour le secteur demandé
      const total = aggregateByActivity(data.observations, activityCode)

      if (total > 0) {
        setInCache(cacheKey, total)
        console.log(
          `[INSEE Melodi] Créations ${codeDepartement}/${activityCode}/${validYear}: ${total}`
        )
        return total
      }
    }

    console.log(
      `[INSEE Melodi] Pas de données pour créations ${codeDepartement}/${activityCode}/${validYear}`
    )
    return null
  } catch (error) {
    console.error('[INSEE Melodi] Erreur parsing JSON:', error)
    return null
  }
}

/**
 * Récupère le stock d'entreprises actives pour un département et secteur donnés
 *
 * @param codeDepartement - Code département (ex: "69" pour le Rhône)
 * @param codeA21 - Code secteur A21 (ex: "FZ" pour Construction)
 * @param annee - Année des données (max 2023, défaut 2023)
 * @returns Nombre d'entreprises actives ou null si non disponible
 */
export async function getStockEntreprises(
  codeDepartement: string,
  codeA21: string,
  annee: number = 2023
): Promise<number | null> {
  // Valider et ajuster l'année
  const validYear = validateYear(annee, 'stocks')

  // Convertir le code A21 en code activité (première lettre)
  const activityCode = codeA21ToActivityCode(codeA21)
  console.log(`[INSEE Melodi] Mapping A21 "${codeA21}" → ACTIVITY "${activityCode}"`)

  const endpoint = `/data/${DATASETS.STOCKS}`
  const params = {
    GEO: `DEP-${codeDepartement}`,
    ACTIVITY: activityCode,
    TIME_PERIOD: validYear,
  }

  const cacheKey = getCacheKey(endpoint, params)

  // Vérifier le cache
  const cached = getFromCache<number>(cacheKey)
  if (cached !== null) {
    console.log(`[INSEE Melodi] Cache hit: ${cacheKey}`)
    return cached
  }

  // Construire l'URL
  const url = `${API_BASE_URL}${endpoint}?GEO=DEP-${codeDepartement}&TIME_PERIOD=${validYear}`

  const response = await fetchWithRetry(url)
  if (!response) {
    return null
  }

  try {
    const data: MelodiApiResponse = await response.json()

    console.log(`[INSEE Melodi] Réponse stock: ${data.observations?.length ?? 0} observations`)

    if (data.observations && data.observations.length > 0) {
      // Agréger les observations pour le secteur demandé
      const total = aggregateByActivity(data.observations, activityCode)

      if (total > 0) {
        setInCache(cacheKey, total)
        console.log(
          `[INSEE Melodi] Stock ${codeDepartement}/${activityCode}/${validYear}: ${total}`
        )
        return total
      }
    }

    console.log(
      `[INSEE Melodi] Pas de données pour stock ${codeDepartement}/${activityCode}/${validYear}`
    )
    return null
  } catch (error) {
    console.error('[INSEE Melodi] Erreur parsing JSON:', error)
    return null
  }
}

/**
 * Récupère les créations et le stock en une seule opération
 * Utile pour calculer le taux de création
 *
 * Note: Les années sont automatiquement ajustées selon les limites disponibles
 * - Créations: max 2024
 * - Stock: max 2023
 */
export async function getIndicateursDemographie(
  codeDepartement: string,
  codeA21: string,
  annee?: number
): Promise<{
  creations: number | null
  stock: number | null
  tauxCreation: number | null
  anneeCreations: number
  anneeStock: number
}> {
  // Utiliser les années max disponibles par défaut, ou ajuster l'année demandée
  const anneeCreations = annee ? validateYear(annee, 'creations') : YEAR_LIMITS.creations.max
  const anneeStock = annee ? validateYear(annee, 'stocks') : YEAR_LIMITS.stocks.max

  const [creations, stock] = await Promise.all([
    getCreationsEntreprises(codeDepartement, codeA21, anneeCreations),
    getStockEntreprises(codeDepartement, codeA21, anneeStock),
  ])

  let tauxCreation: number | null = null
  if (creations !== null && stock !== null && stock > 0) {
    tauxCreation = (creations / stock) * 100
  }

  return {
    creations,
    stock,
    tauxCreation,
    anneeCreations,
    anneeStock,
  }
}

/**
 * Retourne les limites d'années disponibles pour chaque type de données
 */
export function getYearLimits(): typeof YEAR_LIMITS {
  return YEAR_LIMITS
}

/**
 * Retourne les années disponibles sous forme de tableau
 */
export function getAvailableYears(): number[] {
  const years: number[] = []
  for (let y = YEAR_LIMITS.creations.max; y >= YEAR_LIMITS.creations.min; y--) {
    years.push(y)
  }
  return years
}

/**
 * Vide le cache (utile pour les tests)
 */
export function clearCache(): void {
  cache.clear()
  console.log('[INSEE Melodi] Cache vidé')
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

// ============================================================================
// NOUVEAUX DATASETS INSEE MELODI
// ============================================================================

import type { DemographieEntreprises, EffectifsSecteur } from '@/types/territorial'

/**
 * Récupère les données de démographie des entreprises (créations/cessations) au niveau régional
 * Note: Les données sont uniquement disponibles au niveau total (tous secteurs confondus)
 *
 * @param codeRegion - Code région INSEE (ex: "84" pour Auvergne-Rhône-Alpes)
 * @param _codeA21 - Code secteur A21 (ignoré - données tous secteurs uniquement)
 * @param annee - Année des données (2014-2022, défaut 2022)
 * @returns Données de démographie ou null si non disponible
 */
export async function getDemographieEntreprises(
  codeRegion: string,
  _codeA21: string,
  annee: number = 2022
): Promise<DemographieEntreprises | null> {
  // Limites : 2014-2022
  const year = Math.min(Math.max(annee, 2014), 2022)

  const endpoint = `/data/${DATASETS.DEMOGRAPHIE}`
  const params = {
    GEO: `REG-${codeRegion}`,
    TIME_PERIOD: year,
  }

  const cacheKey = getCacheKey(endpoint, params)

  // Vérifier le cache
  const cached = getFromCache<DemographieEntreprises>(cacheKey)
  if (cached !== null) {
    console.log(`[INSEE Melodi] Cache hit démographie: ${cacheKey}`)
    return cached
  }

  const url = `${API_BASE_URL}${endpoint}?GEO=REG-${codeRegion}&TIME_PERIOD=${year}`
  console.log(`[INSEE Melodi] Fetching démographie: ${url}`)

  try {
    const response = await fetchWithRetry(url)
    if (!response) return null

    const data: MelodiApiResponse = await response.json()
    const observations = data.observations || []

    console.log(`[INSEE Melodi] Réponse démographie: ${observations.length} observations`)

    const result: DemographieEntreprises = {
      annee: year,
      creations: 0,
      cessations: 0,
      transfertsEntrants: 0,
      transfertsSortants: 0,
      soldeNet: 0,
    }

    // Debug: collecter les SIDE_MEASURE uniques pour voir ce qui est disponible
    const sideMeasuresFound: Record<string, number> = {}

    // Les données sont au niveau total (_T), on utilise SIDE_MEASURE pour distinguer les types
    for (const obs of observations) {
      // Vérifier que la valeur existe et n'est pas vide
      const rawValue = obs.measures?.OBS_VALUE_NIVEAU
      const numericValue = rawValue?.value ?? (obs.measures?.OBS_VALUE as number | undefined)

      // Ignorer les observations sans valeur numérique valide
      if (numericValue === undefined || numericValue === null) {
        continue
      }

      const sideMeasure = obs.dimensions.SIDE_MEASURE

      // Collecter pour debug
      if (sideMeasure) {
        sideMeasuresFound[sideMeasure] = (sideMeasuresFound[sideMeasure] || 0) + numericValue
      }

      // Mapping des SIDE_MEASURE vers nos champs
      switch (sideMeasure) {
        case 'ECONOMIC_CREATION':
        case 'OTHER_CREATION':
          result.creations += numericValue
          break
        case 'ECONOMIC_CESSATION':
        case 'OTHER_CESSATION':
          result.cessations += numericValue
          break
        case 'TARGET_FIELD_ENTRY':
          result.transfertsEntrants += numericValue
          break
        case 'TARGET_FIELD_EXIT':
          result.transfertsSortants += numericValue
          break
      }
    }

    // Log les mesures trouvées pour debug
    console.log(`[INSEE Melodi DEBUG] Démographie SIDE_MEASURE trouvées:`, sideMeasuresFound)

    result.soldeNet = result.creations - result.cessations

    // Ne retourner que si on a des données significatives
    if (result.creations === 0 && result.cessations === 0) {
      console.log(
        `[INSEE Melodi] Pas de données démographie exploitables pour région ${codeRegion}/${year}`
      )
      return null
    }

    setInCache(cacheKey, result)
    console.log(
      `[INSEE Melodi] Démographie ${year} région ${codeRegion}: créations=${result.creations}, cessations=${result.cessations}, solde=${result.soldeNet}`
    )

    return result
  } catch (error) {
    console.error('[INSEE Melodi] Erreur démographie:', error)
    return null
  }
}

/**
 * Récupère les effectifs salariés du secteur dans un département
 * Note: Le dataset FLORES_A38 peut ne pas avoir de données détaillées par département.
 * En fallback, on utilise les données totales (tous secteurs).
 *
 * @param codeDep - Code département (ex: "69")
 * @param codeA21 - Code secteur A21 (ex: "FZ")
 * @param annee - Année des données (défaut 2022)
 * @returns Effectifs ou null si non disponible
 */
export async function getEffectifsSecteur(
  codeDep: string,
  codeA21: string,
  annee: number = 2022
): Promise<EffectifsSecteur | null> {
  const activityCode = codeA21ToActivityCode(codeA21)

  const endpoint = `/data/${DATASETS.EFFECTIFS}`
  const params = {
    GEO: `DEP-${codeDep}`,
    TIME_PERIOD: annee,
  }

  const cacheKey = getCacheKey(endpoint, { ...params, ACTIVITY: activityCode })

  // Vérifier le cache
  const cached = getFromCache<EffectifsSecteur>(cacheKey)
  if (cached !== null) {
    console.log(`[INSEE Melodi] Cache hit effectifs: ${cacheKey}`)
    return cached
  }

  // Essayer d'abord sans filtre secteur pour voir les données disponibles
  const url = `${API_BASE_URL}${endpoint}?GEO=DEP-${codeDep}&TIME_PERIOD=${annee}`
  console.log(`[INSEE Melodi] Fetching effectifs: ${url}`)

  try {
    const response = await fetchWithRetry(url)
    if (!response) return null

    const data: MelodiApiResponse = await response.json()
    const observations = data.observations || []

    console.log(`[INSEE Melodi] Réponse effectifs: ${observations.length} observations`)

    if (observations.length === 0) {
      console.log(`[INSEE Melodi] Pas de données effectifs FLORES pour ${codeDep}/${annee}`)
      return null
    }

    // Chercher les données par secteur A38 qui commence par notre code A21
    const filtered = observations.filter((obs) => {
      const activity =
        obs.dimensions.ACTIVITY ||
        (obs.dimensions as Record<string, string>).A38 ||
        (obs.dimensions as Record<string, string>).ACTIVITY_A38
      return activity?.startsWith(activityCode)
    })

    let effectifTotal = 0
    let nombreEtablissements = 0

    // Si pas de données filtrées, utiliser le total
    const dataToProcess = filtered.length > 0 ? filtered : observations

    for (const obs of dataToProcess) {
      const measure =
        (obs.dimensions as Record<string, string>).FLORES_MEASURE ||
        (obs.dimensions as Record<string, string>).MEASURE ||
        obs.dimensions.SIDE_MEASURE
      const value = obs.measures?.OBS_VALUE_NIVEAU?.value ?? obs.measures?.OBS_VALUE ?? 0

      // Codes FLORES courants pour effectifs et établissements
      if (
        measure === 'SAL' ||
        measure === 'EFF' ||
        measure === 'EFFECTIF' ||
        measure === 'NB_SAL'
      ) {
        effectifTotal += value
      } else if (measure === 'ETAB' || measure === 'NB_ETAB' || measure === 'ETABLISSEMENT') {
        nombreEtablissements += value
      }
    }

    if (effectifTotal === 0 && nombreEtablissements === 0) {
      console.log(
        `[INSEE Melodi] Pas de données effectifs exploitables pour ${codeDep}/${activityCode}/${annee}`
      )
      return null
    }

    const result: EffectifsSecteur = {
      annee,
      effectifTotal: Math.round(effectifTotal),
      nombreEtablissements: Math.round(nombreEtablissements),
      effectifMoyen:
        nombreEtablissements > 0 ? Math.round(effectifTotal / nombreEtablissements) : undefined,
    }

    setInCache(cacheKey, result)
    console.log(
      `[INSEE Melodi] Effectifs ${codeDep}/${activityCode}/${annee}: ${result.effectifTotal} salariés, ${result.nombreEtablissements} établissements`
    )

    return result
  } catch (error) {
    console.error('[INSEE Melodi] Erreur effectifs:', error)
    return null
  }
}

/**
 * Récupère le taux de chômage d'un département
 * Le dataset RP_EMPLOI donne la population par statut d'emploi (EMPSTA_ENQ)
 * On calcule le taux depuis les actifs occupés et chômeurs
 *
 * @param codeDep - Code département (ex: "69")
 * @param annee - Année des données (défaut 2022)
 * @returns Taux de chômage et année ou null si non disponible
 */
export async function getTauxChomage(
  codeDep: string,
  annee: number = 2022
): Promise<{ taux: number; annee: number } | null> {
  const endpoint = `/data/${DATASETS.CHOMAGE}`
  const params = {
    GEO: `DEP-${codeDep}`,
    TIME_PERIOD: annee,
  }

  const cacheKey = getCacheKey(endpoint, params)

  // Vérifier le cache
  const cached = getFromCache<{ taux: number; annee: number }>(cacheKey)
  if (cached !== null) {
    console.log(`[INSEE Melodi] Cache hit chômage: ${cacheKey}`)
    return cached
  }

  const url = `${API_BASE_URL}${endpoint}?GEO=DEP-${codeDep}&TIME_PERIOD=${annee}`
  console.log(`[INSEE Melodi] Fetching chômage: ${url}`)

  try {
    const response = await fetchWithRetry(url)
    if (!response) return null

    const data: MelodiApiResponse = await response.json()
    const observations = data.observations || []

    console.log(`[INSEE Melodi] Réponse chômage: ${observations.length} observations`)

    if (observations.length === 0) {
      console.log(`[INSEE Melodi] Pas de données chômage pour ${codeDep}/${annee}`)
      return null
    }

    // Collecter les données par statut d'emploi pour la tranche d'âge active (15-64 ans)
    let actifsOccupes = 0
    let chomeurs = 0

    // Les codes EMPSTA_ENQ varient selon le dataset
    // On cherche les patterns courants
    for (const obs of observations) {
      const empsta =
        (obs.dimensions as Record<string, string>).EMPSTA_ENQ ||
        (obs.dimensions as Record<string, string>).EMPSTA ||
        (obs.dimensions as Record<string, string>).ACTIVITY_STATUS
      const age =
        (obs.dimensions as Record<string, string>).AGE ||
        (obs.dimensions as Record<string, string>).AGE_GROUP
      const value = obs.measures?.OBS_VALUE_NIVEAU?.value ?? obs.measures?.OBS_VALUE ?? 0

      // Ne prendre que les 15-64 ans (population active) si disponible
      if (age && !age.includes('15') && !age.includes('64') && age !== '_T' && age !== 'TOTAL') {
        continue
      }

      // Codes pour actifs occupés (employés)
      if (
        empsta === '11' ||
        empsta === '12' ||
        empsta === 'EMP' ||
        empsta === 'EMPLOYED' ||
        empsta?.startsWith('1')
      ) {
        actifsOccupes += value
      }
      // Codes pour chômeurs
      else if (
        empsta === '21' ||
        empsta === '22' ||
        empsta === 'UNE' ||
        empsta === 'UNEMPLOYED' ||
        empsta?.startsWith('2')
      ) {
        chomeurs += value
      }
    }

    // Si on n'a pas pu distinguer, essayer avec les mesures directes
    if (actifsOccupes === 0 && chomeurs === 0) {
      for (const obs of observations) {
        const measure =
          (obs.dimensions as Record<string, string>).RP_MEASURE ||
          (obs.dimensions as Record<string, string>).MEASURE ||
          obs.dimensions.SIDE_MEASURE
        const value = obs.measures?.OBS_VALUE_NIVEAU?.value ?? obs.measures?.OBS_VALUE ?? 0

        if (measure === 'TCHO' || measure === 'TXCHO' || measure === 'UNEMPLOYMENT_RATE') {
          // Taux direct trouvé
          const result = { taux: value, annee }
          setInCache(cacheKey, result)
          console.log(`[INSEE Melodi] Chômage ${codeDep}/${annee}: ${value}%`)
          return result
        }
        if (measure === 'ACT' || measure === 'ACTOCC' || measure === 'EMPLOYED') {
          actifsOccupes += value
        } else if (measure === 'CHO' || measure === 'CHOMEUR' || measure === 'UNEMPLOYED') {
          chomeurs += value
        }
      }
    }

    // Calculer le taux si on a les données
    const populationActive = actifsOccupes + chomeurs
    if (populationActive > 0 && chomeurs > 0) {
      const taux = (chomeurs / populationActive) * 100
      const result = { taux: Math.round(taux * 10) / 10, annee }
      setInCache(cacheKey, result)
      console.log(
        `[INSEE Melodi] Chômage calculé ${codeDep}/${annee}: ${result.taux}% (actifs=${actifsOccupes}, chômeurs=${chomeurs})`
      )
      return result
    }

    console.log(`[INSEE Melodi] Pas de données chômage exploitables pour ${codeDep}/${annee}`)
    return null
  } catch (error) {
    console.error('[INSEE Melodi] Erreur chômage:', error)
    return null
  }
}

/**
 * Récupère le revenu médian d'un département
 * Le dataset FILOSOFI utilise MED_SL pour la médiane du niveau de vie
 *
 * @param codeDep - Code département (ex: "69")
 * @param annee - Année des données (défaut 2021)
 * @returns Revenu médian et année ou null si non disponible
 */
export async function getRevenuMedian(
  codeDep: string,
  annee: number = 2021
): Promise<{ revenu: number; annee: number } | null> {
  const endpoint = `/data/${DATASETS.REVENUS}`
  const params = {
    GEO: `DEP-${codeDep}`,
    TIME_PERIOD: annee,
  }

  const cacheKey = getCacheKey(endpoint, params)

  // Vérifier le cache
  const cached = getFromCache<{ revenu: number; annee: number }>(cacheKey)
  if (cached !== null) {
    console.log(`[INSEE Melodi] Cache hit revenus: ${cacheKey}`)
    return cached
  }

  const url = `${API_BASE_URL}${endpoint}?GEO=DEP-${codeDep}&TIME_PERIOD=${annee}`
  console.log(`[INSEE Melodi] Fetching revenus: ${url}`)

  try {
    const response = await fetchWithRetry(url)
    if (!response) return null

    const data: MelodiApiResponse = await response.json()
    const observations = data.observations || []

    console.log(`[INSEE Melodi] Réponse revenus: ${observations.length} observations`)

    if (observations.length === 0) {
      console.log(`[INSEE Melodi] Pas de données revenus pour ${codeDep}/${annee}`)
      return null
    }

    // Chercher d'abord MED_SL (médiane du niveau de vie standard)
    for (const obs of observations) {
      const measure =
        (obs.dimensions as Record<string, string>).FILOSOFI_MEASURE ||
        (obs.dimensions as Record<string, string>).MEASURE ||
        obs.dimensions.SIDE_MEASURE

      if (measure === 'MED_SL') {
        const value = obs.measures?.OBS_VALUE_NIVEAU?.value ?? obs.measures?.OBS_VALUE
        if (value !== undefined) {
          const result = { revenu: Math.round(value), annee }
          setInCache(cacheKey, result)
          console.log(
            `[INSEE Melodi] Revenu médian (MED_SL) ${codeDep}/${annee}: ${result.revenu}€`
          )
          return result
        }
      }
    }

    // Fallback : chercher d'autres mesures de revenu courantes
    const revenuMeasures = [
      'S_EI_DI', // Revenu disponible médian
      'D1_SL', // Premier décile niveau de vie
      'D5_SL', // Médiane (D5 = Q50)
      'D9_SL', // Neuvième décile
      'MED', // Médiane générique
      'Q50', // Quantile 50%
      'REVMED', // Revenu médian
    ]

    for (const obs of observations) {
      const measure =
        (obs.dimensions as Record<string, string>).FILOSOFI_MEASURE ||
        (obs.dimensions as Record<string, string>).MEASURE ||
        obs.dimensions.SIDE_MEASURE

      if (measure && revenuMeasures.includes(measure)) {
        const value = obs.measures?.OBS_VALUE_NIVEAU?.value ?? obs.measures?.OBS_VALUE
        if (value !== undefined) {
          const result = { revenu: Math.round(value), annee }
          setInCache(cacheKey, result)
          console.log(`[INSEE Melodi] Revenu (${measure}) ${codeDep}/${annee}: ${result.revenu}€`)
          return result
        }
      }
    }

    console.log(`[INSEE Melodi] Pas de données revenus exploitables pour ${codeDep}/${annee}`)
    return null
  } catch (error) {
    console.error('[INSEE Melodi] Erreur revenus:', error)
    return null
  }
}

/**
 * Récupère le PIB d'une région
 * Le PIB est exprimé en millions d'euros (UNIT_MULT = 6)
 *
 * @param codeRegion - Code région INSEE (ex: "84")
 * @param annee - Année des données (défaut 2022)
 * @returns PIB en millions d'euros et année ou null si non disponible
 */
export async function getPibRegional(
  codeRegion: string,
  annee: number = 2022
): Promise<{ pib: number; annee: number } | null> {
  const endpoint = `/data/${DATASETS.PIB}`
  const params = {
    GEO: `REG-${codeRegion}`,
    TIME_PERIOD: annee,
  }

  const cacheKey = getCacheKey(endpoint, params)

  // Vérifier le cache
  const cached = getFromCache<{ pib: number; annee: number }>(cacheKey)
  if (cached !== null) {
    console.log(`[INSEE Melodi] Cache hit PIB: ${cacheKey}`)
    return cached
  }

  const url = `${API_BASE_URL}${endpoint}?GEO=REG-${codeRegion}&TIME_PERIOD=${annee}`
  console.log(`[INSEE Melodi] Fetching PIB: ${url}`)

  try {
    const response = await fetchWithRetry(url)
    if (!response) return null

    const data: MelodiApiResponse = await response.json()
    const observations = data.observations || []

    console.log(`[INSEE Melodi] Réponse PIB: ${observations.length} observations`)

    if (observations.length === 0) {
      console.log(`[INSEE Melodi] Pas de données PIB pour région ${codeRegion}/${annee}`)
      return null
    }

    // Chercher le PIB (B1G = Valeur ajoutée brute, B1GQ = PIB)
    // Les codes STO courants pour le PIB régional
    const pibCodes = ['B1G', 'B1GQ', 'PIB', 'GDP']

    for (const obs of observations) {
      const sto =
        (obs.dimensions as Record<string, string>).STO ||
        (obs.dimensions as Record<string, string>).MEASURE ||
        obs.dimensions.SIDE_MEASURE

      if (sto && pibCodes.includes(sto)) {
        const value = obs.measures?.OBS_VALUE_NIVEAU?.value ?? obs.measures?.OBS_VALUE

        if (value !== undefined) {
          // La valeur est déjà en millions d'euros (UNIT_MULT = 6)
          const pibMillions = Math.round(value)
          const result = { pib: pibMillions, annee }
          setInCache(cacheKey, result)
          console.log(
            `[INSEE Melodi] PIB région ${codeRegion}/${annee}: ${pibMillions.toLocaleString('fr-FR')} M€ (${(pibMillions / 1000).toFixed(1)} Mds €)`
          )
          return result
        }
      }
    }

    console.log(`[INSEE Melodi] Pas de données PIB exploitables pour région ${codeRegion}/${annee}`)
    return null
  } catch (error) {
    console.error('[INSEE Melodi] Erreur PIB:', error)
    return null
  }
}
