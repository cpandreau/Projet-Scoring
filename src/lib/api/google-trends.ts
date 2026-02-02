/**
 * Service pour récupérer les tendances de recherche via Google Trends
 *
 * Utilise google-trends-api (non-officiel) pour accéder aux données Google Trends
 * Note: API non-officielle, peut être rate-limited
 */

import googleTrends from 'google-trends-api'
import { getNafInfo, type NafInfo, normalizeNafCode } from './naf-nomenclature'

// ============================================================================
// TYPES
// ============================================================================

export interface TrendPoint {
  date: string
  value: number
}

export interface TrendData {
  keyword: string
  timeline: TrendPoint[]
  averageInterest: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface TrendsMethodology {
  source: string
  nafCode: string
  nafLabel: string
  keyword: string
  period: string
  zone: string
  nafSource: NafInfo['source']
}

export interface SectorTrendsResult {
  mainTrend: TrendData | null
  relatedQueries: string[]
  methodology?: TrendsMethodology
  error?: string
}

interface TimelineDataPoint {
  formattedTime?: string
  time?: string
  value?: number[]
}

interface RankedKeyword {
  query: string
  value?: number
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 heures (Trends ne change pas souvent)
const CACHE_MAX_ENTRIES = 50

// ============================================================================
// CACHE EN MÉMOIRE
// ============================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<SectorTrendsResult>>()

function getCacheKey(nafCode: string): string {
  // Utiliser le code NAF complet normalisé pour un cache plus précis
  return `trends:${normalizeNafCode(nafCode)}`
}

function getFromCache(key: string): SectorTrendsResult | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }

  return entry.data
}

function setInCache(key: string, data: SectorTrendsResult): void {
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
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Get trend data for a sector based on NAF code
 * Uses INSEE API to get the official NAF label and generate relevant keywords
 */
export async function fetchSectorTrends(nafCode: string): Promise<SectorTrendsResult> {
  if (!nafCode) {
    return { mainTrend: null, relatedQueries: [], error: 'Code NAF manquant' }
  }

  const cacheKey = getCacheKey(nafCode)

  // Vérifier le cache
  const cached = getFromCache(cacheKey)
  if (cached !== null) {
    console.log(`[Google Trends] Cache hit: ${cacheKey}`)
    return cached
  }

  // Récupérer les infos NAF via le service (INSEE API + fallback)
  const nafInfo = await getNafInfo(nafCode)
  const mainKeyword = nafInfo.keywords[0]

  if (!mainKeyword) {
    return { mainTrend: null, relatedQueries: [], error: 'Pas de mots-clés pour ce secteur' }
  }

  console.log(`[Google Trends] Fetching trends for "${nafInfo.label}" → keyword: "${mainKeyword}"`)

  try {
    // Fetch interest over time (last 12 months)
    const interestResult = await googleTrends.interestOverTime({
      keyword: mainKeyword,
      startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      endTime: new Date(),
      geo: 'FR',
      hl: 'fr',
    })

    const interestData = JSON.parse(interestResult)
    const timelineData: TimelineDataPoint[] = interestData.default?.timelineData || []

    // Parse timeline
    const timeline: TrendPoint[] = timelineData.map((point) => ({
      date: point.formattedTime || new Date(Number(point.time) * 1000).toISOString(),
      value: point.value?.[0] || 0,
    }))

    // Calculate trend
    const { trend, trendPercentage, averageInterest } = calculateTrend(timeline)

    // Fetch related queries
    let relatedQueries: string[] = []
    try {
      const relatedResult = await googleTrends.relatedQueries({
        keyword: mainKeyword,
        geo: 'FR',
        hl: 'fr',
      })
      const relatedData = JSON.parse(relatedResult)
      const topQueries: RankedKeyword[] = relatedData.default?.rankedList?.[0]?.rankedKeyword || []
      relatedQueries = topQueries.slice(0, 5).map((q) => q.query)
    } catch (e) {
      // Related queries may fail, not critical
      console.warn('[Google Trends] Failed to fetch related queries:', e)
    }

    const result: SectorTrendsResult = {
      mainTrend: {
        keyword: mainKeyword,
        timeline,
        averageInterest,
        trend,
        trendPercentage,
      },
      relatedQueries,
      methodology: {
        source: 'Google Trends',
        nafCode: nafInfo.code,
        nafLabel: nafInfo.label,
        keyword: mainKeyword,
        period: '12 derniers mois',
        zone: 'France',
        nafSource: nafInfo.source,
      },
    }

    // Mettre en cache
    setInCache(cacheKey, result)

    console.log(
      `[Google Trends] "${nafInfo.label}" (${mainKeyword}): trend=${trend}, change=${trendPercentage}%, avg=${averageInterest}`
    )

    return result
  } catch (error) {
    console.error('[Google Trends] Error:', error)

    const errorResult: SectorTrendsResult = {
      mainTrend: null,
      relatedQueries: [],
      methodology: {
        source: 'Google Trends',
        nafCode: nafInfo.code,
        nafLabel: nafInfo.label,
        keyword: mainKeyword,
        period: '12 derniers mois',
        zone: 'France',
        nafSource: nafInfo.source,
      },
      error: 'Impossible de récupérer les tendances (limite atteinte ou service indisponible)',
    }

    // Cache aussi les erreurs pour éviter de spammer l'API
    setInCache(cacheKey, errorResult)

    return errorResult
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate trend direction and percentage from timeline data
 */
function calculateTrend(timeline: TrendPoint[]): {
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  averageInterest: number
} {
  if (timeline.length < 4) {
    return { trend: 'stable', trendPercentage: 0, averageInterest: 0 }
  }

  // Compare last 3 months vs previous 3 months (assuming weekly data = ~12 points per 3 months)
  const recentMonths = timeline.slice(-12)
  const previousMonths = timeline.slice(-24, -12)

  const recentAvg =
    recentMonths.length > 0
      ? recentMonths.reduce((sum, p) => sum + p.value, 0) / recentMonths.length
      : 0

  const previousAvg =
    previousMonths.length > 0
      ? previousMonths.reduce((sum, p) => sum + p.value, 0) / previousMonths.length
      : recentAvg

  const averageInterest = Math.round(
    timeline.reduce((sum, p) => sum + p.value, 0) / timeline.length
  )

  if (previousAvg === 0) {
    return { trend: 'stable', trendPercentage: 0, averageInterest }
  }

  const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100

  let trend: 'up' | 'down' | 'stable'
  if (changePercent > 10) {
    trend = 'up'
  } else if (changePercent < -10) {
    trend = 'down'
  } else {
    trend = 'stable'
  }

  return {
    trend,
    trendPercentage: Math.round(changePercent),
    averageInterest,
  }
}

/**
 * Clear the trends cache (for testing)
 */
export function clearTrendsCache(): void {
  cache.clear()
  console.log('[Google Trends] Cache cleared')
}
