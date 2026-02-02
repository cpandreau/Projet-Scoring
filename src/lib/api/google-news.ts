/**
 * Service pour récupérer les actualités via Google News RSS
 *
 * Pas de limite de requêtes, pas de clé API requise
 * Documentation non-officielle: https://www.newscatcherapi.com/blog-posts/google-news-rss-search-parameters-the-missing-documentaiton
 */

import { parseStringPromise } from 'xml2js'
import { getNafInfo, type NafInfo } from './naf-nomenclature'

// ============================================================================
// TYPES
// ============================================================================

export interface NewsArticle {
  title: string
  link: string
  pubDate: string
  source: string
  sourceUrl: string
  description?: string // Extrait de l'article
  thumbnail?: string // Image thumbnail si disponible
}

export interface NewsMethodology {
  source: string
  searchQuery: string
  filters: string[]
  period: string
  zone: string
  timestamp: string
}

export interface CompanyNewsResult {
  articles: NewsArticle[]
  methodology: NewsMethodology
}

export interface SectorNewsMethodology {
  source: string
  nafCode: string
  nafLabel: string
  keywords: string[]
  query: string
  zone: string
  period: string
  nafSource: NafInfo['source']
}

export interface SectorNewsResult {
  articles: NewsArticle[]
  methodology: SectorNewsMethodology
}

interface GoogleNewsOptions {
  query: string
  language?: string // default: 'fr'
  country?: string // default: 'FR'
  maxResults?: number // default: 10
  period?: string // default: '30d' (7d, 30d, 1y)
}

export interface CompanyNewsOptions {
  companyName: string
  city?: string // Ville du siège (améliore la pertinence pour les PME locales)
  additionalTerms?: string[] // Dirigeant, enseigne, marque commerciale
  maxResults?: number
}

interface RSSItem {
  title?: string[]
  link?: string[]
  pubDate?: string[]
  description?: string[]
  source?: Array<{ _: string; $: { url: string } } | string>
  'media:content'?: Array<{ $?: { url?: string } }>
  'media:thumbnail'?: Array<{ $?: { url?: string } }>
  enclosure?: Array<{ $?: { url?: string; type?: string } }>
}

interface RSSFeed {
  rss?: {
    channel?: Array<{
      item?: RSSItem[]
    }>
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const GOOGLE_NEWS_BASE = 'https://news.google.com/rss'
const REQUEST_TIMEOUT_MS = 10000
const CACHE_TTL_SECONDS = 3600 // 1 heure
const DEFAULT_PERIOD = '30d' // 7d, 30d, 1y

// Exclusions pour filtrer les offres d'emploi et annonces
const EXCLUSIONS = '-recrutement -emploi -stage -alternance -offre -CDI -CDD -interim'
const EXCLUSIONS_LIST = [
  'recrutement',
  'emploi',
  'stage',
  'alternance',
  'offre',
  'CDI',
  'CDD',
  'interim',
]

// Mots-clés trop génériques qui doivent être combinés avec le contexte métier
const GENERIC_KEYWORDS = [
  'cheveux',
  'ongles',
  'peau',
  'corps',
  'beauté',
  'soin',
  'massage',
  'bien-être',
  'pain',
  'viande',
  'poisson',
  'légumes',
  'fruits',
]

// Patterns pour exclure les articles hors sujet
const EXCLUDE_PATTERNS = [
  /hitler/i,
  /guerre mondiale/i,
  /seconde guerre/i,
  /première guerre/i,
  /nazi/i,
  /élection présidentielle/i,
  /politique étrangère/i,
  /fait divers/i,
  /meurtre/i,
  /assassinat/i,
  /viol/i,
  /agression/i,
  /attentat/i,
  /terrorisme/i,
]

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Fetch news from Google News RSS feed
 */
export async function fetchGoogleNews(options: GoogleNewsOptions): Promise<NewsArticle[]> {
  const {
    query,
    language = 'fr',
    country = 'FR',
    maxResults = 10,
    period = DEFAULT_PERIOD,
  } = options

  // Ajouter le filtre temporel à la requête
  const queryWithPeriod = `${query} when:${period}`
  const encodedQuery = encodeURIComponent(queryWithPeriod)
  const url = `${GOOGLE_NEWS_BASE}/search?q=${encodedQuery}&hl=${language}&gl=${country}&ceid=${country}:${language}`

  try {
    console.log(`[Google News] Fetching: ${url}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: CACHE_TTL_SECONDS },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[Google News] HTTP error: ${response.status}`)
      return []
    }

    const xml = await response.text()
    const result: RSSFeed = await parseStringPromise(xml)

    const items = result?.rss?.channel?.[0]?.item || []

    console.log(`[Google News] Found ${items.length} articles for query "${query}"`)

    return items.slice(0, maxResults).map((item: RSSItem) => ({
      title: item.title?.[0] || '',
      link: item.link?.[0] || '',
      pubDate: item.pubDate?.[0] || '',
      source: extractSource(item.source),
      sourceUrl: extractSourceUrl(item.source),
      description: extractDescription(item.description?.[0]),
      thumbnail: extractThumbnail(item),
    }))
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Google News] Request timeout')
    } else {
      console.error('[Google News] Error:', error)
    }
    return []
  }
}

/**
 * Fetch news for a specific company with context enrichment
 * Uses business keywords and optional city to improve relevance
 */
export async function fetchCompanyNews(options: CompanyNewsOptions): Promise<CompanyNewsResult> {
  const { companyName, city, additionalTerms, maxResults = 5 } = options

  // Construire la requête avec les termes de recherche
  const query = buildCompanyQuery(companyName, city, additionalTerms)

  // Fetch plus de résultats pour pouvoir filtrer ensuite
  const articles = await fetchGoogleNews({ query, maxResults: maxResults * 3 })

  // Filtrer les résultats pour ne garder que ceux pertinents
  const filteredArticles = filterRelevantArticles(articles, companyName)

  console.log(
    `[Google News] Company "${companyName}": ${articles.length} fetched, ${filteredArticles.length} relevant`
  )

  return {
    articles: filteredArticles.slice(0, maxResults),
    methodology: {
      source: 'Google News RSS',
      searchQuery: query,
      filters: EXCLUSIONS_LIST,
      period: DEFAULT_PERIOD,
      zone: 'France',
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Build optimized company search query
 */
function buildCompanyQuery(companyName: string, city?: string, additionalTerms?: string[]): string {
  const searchTerms: string[] = []

  // Nom exact de l'entreprise
  searchTerms.push(`"${companyName}"`)

  // Termes additionnels (dirigeant, enseigne, marque...)
  if (additionalTerms?.length) {
    additionalTerms.forEach((term) => {
      if (term && term.trim()) {
        searchTerms.push(`"${term.trim()}"`)
      }
    })
  }

  // Construire avec OR si plusieurs termes
  const termsPart = searchTerms.length > 1 ? `(${searchTerms.join(' OR ')})` : searchTerms[0]

  // Ajouter contexte entreprise pour filtrer homonymes
  const contextPart = '(entreprise OR société OR SARL OR SAS OR SA OR EURL)'

  // Ajouter localisation
  const locationPart = city ? `${city} France` : 'France'

  return `${termsPart} ${contextPart} ${locationPart} ${EXCLUSIONS}`
}

/**
 * Filter articles to keep only those that actually mention the company name
 */
function filterRelevantArticles(articles: NewsArticle[], companyName: string): NewsArticle[] {
  const nameLower = companyName.toLowerCase()
  // Extraire les mots significatifs (> 2 caractères, pas les mots communs)
  const stopWords = ['les', 'des', 'une', 'est', 'son', 'ses', 'par', 'pour', 'sur', 'avec', 'dans']
  const nameWords = nameLower.split(/\s+/).filter((w) => w.length > 2 && !stopWords.includes(w))

  return articles.filter((article) => {
    const titleLower = article.title.toLowerCase()

    // Le titre doit contenir le nom complet
    if (titleLower.includes(nameLower)) {
      return true
    }

    // Ou au moins 70% des mots significatifs du nom
    if (nameWords.length > 0) {
      const matchingWords = nameWords.filter((word) => titleLower.includes(word))
      const matchRatio = matchingWords.length / nameWords.length
      return matchRatio >= 0.7
    }

    return false
  })
}

/**
 * Fetch news for a sector based on NAF code (legacy - returns articles only)
 */
export async function fetchSectorNews(nafCode: string, maxResults = 5): Promise<NewsArticle[]> {
  const result = await fetchSectorNewsWithMethodology(nafCode, maxResults)
  return result.articles
}

/**
 * Fetch news for a sector based on NAF code with full methodology info
 * Uses INSEE API to get the official NAF label and generate relevant keywords
 */
export async function fetchSectorNewsWithMethodology(
  nafCode: string,
  maxResults = 5
): Promise<SectorNewsResult> {
  // Récupérer les infos NAF via le service (INSEE API + fallback)
  const nafInfo = await getNafInfo(nafCode)

  // Construire la requête optimisée avec exclusions
  const query = buildSectorQuery(nafInfo.keywords, nafInfo.label)

  console.log(`[Google News] Sector "${nafInfo.label}": query="${query}"`)

  // Fetch plus de résultats pour filtrer ensuite
  const articles = await fetchGoogleNews({ query, maxResults: maxResults * 3 })

  // Filtrer les articles non pertinents
  const filteredArticles = filterSectorArticles(articles, nafInfo.keywords, nafInfo.label)

  console.log(
    `[Google News] Sector "${nafInfo.label}": ${articles.length} fetched, ${filteredArticles.length} relevant`
  )

  return {
    articles: filteredArticles.slice(0, maxResults),
    methodology: {
      source: 'Google News RSS',
      nafCode: nafInfo.code,
      nafLabel: nafInfo.label,
      keywords: nafInfo.keywords,
      query,
      zone: 'France',
      period: '30 derniers jours',
      nafSource: nafInfo.source,
    },
  }
}

/**
 * Build optimized sector search query with exclusions
 * Combines generic keywords with business context for better relevance
 */
function buildSectorQuery(keywords: string[], nafLabel: string): string {
  // Prendre max 4 mots-clés pour éviter dilution
  const topKeywords = keywords.slice(0, 4)

  // Extraire le premier mot significatif du label NAF pour le contexte
  const contextWord =
    nafLabel
      .toLowerCase()
      .split(/[\s,'-]+/)
      .find((w) => w.length > 3) || ''

  // Traiter les mots-clés génériques en les combinant avec le contexte
  const processedKeywords = topKeywords.map((keyword) => {
    const kwLower = keyword.toLowerCase()

    // Si mot-clé générique, le combiner avec le contexte métier
    if (GENERIC_KEYWORDS.includes(kwLower) && contextWord) {
      return `"${keyword} ${contextWord}"`
    }

    // Mettre entre guillemets les expressions avec espaces
    return keyword.includes(' ') ? `"${keyword}"` : keyword
  })

  const keywordsPart = processedKeywords.join(' OR ')

  // Ajouter contexte France et exclusions
  return `(${keywordsPart}) France ${EXCLUSIONS}`
}

/**
 * Filter sector articles to remove off-topic content
 */
function filterSectorArticles(
  articles: NewsArticle[],
  keywords: string[],
  nafLabel: string
): NewsArticle[] {
  // Extraire les mots du contexte métier
  const contextWords = nafLabel
    .toLowerCase()
    .split(/[\s,'-]+/)
    .filter((w) => w.length > 3)

  const keywordsLower = keywords.map((k) => k.toLowerCase())

  return articles.filter((article) => {
    const titleLower = article.title.toLowerCase()

    // Exclure les articles qui correspondent aux patterns indésirables
    if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(titleLower))) {
      return false
    }

    // Vérifier qu'au moins un mot-clé ou mot du contexte est présent
    const hasKeyword = keywordsLower.some((kw) => titleLower.includes(kw))
    const hasContext = contextWords.some((w) => titleLower.includes(w))

    return hasKeyword || hasContext
  })
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extract source name from RSS item
 */
function extractSource(
  source: Array<{ _: string; $: { url: string } } | string> | undefined
): string {
  if (!source || source.length === 0) return 'Source inconnue'

  const firstSource = source[0]
  if (typeof firstSource === 'string') return firstSource
  if (typeof firstSource === 'object' && '_' in firstSource) return firstSource._

  return 'Source inconnue'
}

/**
 * Extract source URL from RSS item
 */
function extractSourceUrl(
  source: Array<{ _: string; $: { url: string } } | string> | undefined
): string {
  if (!source || source.length === 0) return ''

  const firstSource = source[0]
  if (typeof firstSource === 'object' && '$' in firstSource) {
    return firstSource.$.url || ''
  }

  return ''
}

/**
 * Extract and clean description from RSS item
 */
function extractDescription(rawDescription: string | undefined): string | undefined {
  if (!rawDescription) return undefined

  const cleaned = cleanHtml(rawDescription)
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Limiter à 200 caractères
  if (cleaned.length > 200) {
    return cleaned.substring(0, 197) + '...'
  }

  return cleaned || undefined
}

/**
 * Clean HTML tags and entities from a string
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * Extract thumbnail image from RSS item
 */
function extractThumbnail(item: RSSItem): string | undefined {
  // Try media:content first
  const mediaContent = item['media:content']?.[0]?.$?.url
  if (mediaContent) return mediaContent

  // Try media:thumbnail
  const mediaThumbnail = item['media:thumbnail']?.[0]?.$?.url
  if (mediaThumbnail) return mediaThumbnail

  // Try enclosure (if it's an image)
  const enclosure = item.enclosure?.[0]
  if (enclosure?.$?.url && enclosure?.$?.type?.startsWith('image/')) {
    return enclosure.$.url
  }

  // Try to extract from description HTML
  const description = item.description?.[0]
  if (description) {
    const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/)
    if (imgMatch?.[1]) return imgMatch[1]
  }

  return undefined
}

/**
 * Get relevant keywords for a NAF sector
 */
function getSectorKeywords(nafCode: string): string[] {
  const sectorPrefix = nafCode.substring(0, 2)

  // Mapping des secteurs NAF vers mots-clés pertinents pour la presse française
  const sectorKeywordsMap: Record<string, string[]> = {
    '01': ['agriculture', 'agricole', 'exploitation agricole'],
    '10': ['agroalimentaire', 'industrie alimentaire'],
    '41': ['construction', 'BTP', 'immobilier neuf'],
    '42': ['génie civil', 'travaux publics', 'infrastructure'],
    '43': ['bâtiment', 'travaux construction', 'BTP'],
    '45': ['automobile', 'concessionnaire auto', 'véhicules'],
    '46': ['commerce gros', 'négoce', 'grossiste'],
    '47': ['commerce détail', 'retail', 'grande distribution'],
    '49': ['transport routier', 'logistique', 'fret'],
    '50': ['transport maritime', 'shipping', 'naval'],
    '51': ['transport aérien', 'aviation', 'aéronautique'],
    '52': ['entreposage', 'logistique', 'supply chain'],
    '55': ['hôtellerie', 'hébergement touristique'],
    '56': ['restauration', 'food service', 'CHR'],
    '58': ['édition', 'presse', 'média'],
    '59': ['audiovisuel', 'production cinéma'],
    '61': ['télécommunications', 'télécom', 'opérateur'],
    '62': ['informatique', 'ESN', 'tech', 'numérique'],
    '63': ['services numériques', 'data', 'digital'],
    '64': ['banque', 'finance', 'établissement bancaire'],
    '65': ['assurance', 'mutuelle', 'prévoyance'],
    '66': ['fintech', 'services financiers'],
    '68': ['immobilier', 'agence immobilière', 'foncier'],
    '69': ['expertise comptable', 'cabinet comptable', 'audit'],
    '70': ['conseil entreprise', 'consulting', 'management'],
    '71': ['ingénierie', 'architecture', 'bureau études'],
    '72': ['R&D', 'recherche', 'innovation'],
    '73': ['publicité', 'marketing', 'communication'],
    '74': ['design', 'création graphique'],
    '77': ['location', 'leasing', 'LOA'],
    '78': ['intérim', 'recrutement', 'emploi'],
    '79': ['tourisme', 'agence voyages'],
    '80': ['sécurité privée', 'surveillance'],
    '81': ['services bâtiments', 'facility management'],
    '82': ['services administratifs', 'BPO'],
    '85': ['enseignement', 'formation', 'éducation'],
    '86': ['santé', 'médical', 'hospitalier'],
    '87': ['EHPAD', 'médico-social'],
    '88': ['action sociale', 'aide à domicile'],
    '90': ['spectacle vivant', 'culture'],
    '91': ['musées', 'patrimoine culturel'],
    '92': ['jeux hasard', 'casino'],
    '93': ['sport', 'fitness', 'loisirs'],
    '94': ['associations', 'organisations professionnelles'],
    '95': ['réparation', 'SAV', 'maintenance'],
    '96': ['services personnels', 'bien-être'],
  }

  const baseKeywords = sectorKeywordsMap[sectorPrefix]
  if (!baseKeywords) {
    // Fallback générique
    return ['économie France', 'entreprises françaises']
  }

  // Ajouter "France" pour cibler les actualités nationales
  return [...baseKeywords.slice(0, 3), 'France']
}

/**
 * Format relative time in French
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return "À l'instant"
  }
  if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  }
  if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  }
  if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

/**
 * Get sector label from NAF code
 */
export function getSectorLabel(nafCode: string): string {
  const sectorPrefix = nafCode.substring(0, 2)

  const sectorLabelsMap: Record<string, string> = {
    '01': 'Agriculture',
    '10': 'Agroalimentaire',
    '41': 'Construction',
    '42': 'Génie civil',
    '43': 'Travaux de construction',
    '45': 'Commerce automobile',
    '46': 'Commerce de gros',
    '47': 'Commerce de détail',
    '49': 'Transport terrestre',
    '50': 'Transport maritime',
    '51': 'Transport aérien',
    '52': 'Entreposage et logistique',
    '55': 'Hôtellerie',
    '56': 'Restauration',
    '58': 'Édition',
    '59': 'Audiovisuel',
    '61': 'Télécommunications',
    '62': 'Informatique',
    '63': "Services d'information",
    '64': 'Services financiers',
    '65': 'Assurance',
    '66': 'Activités auxiliaires financières',
    '68': 'Immobilier',
    '69': 'Juridique et comptabilité',
    '70': 'Conseil et gestion',
    '71': 'Architecture et ingénierie',
    '72': 'Recherche et développement',
    '73': 'Publicité et études de marché',
    '74': 'Design et création',
    '77': 'Location et crédit-bail',
    '78': 'Emploi et recrutement',
    '79': 'Tourisme',
    '80': 'Sécurité privée',
    '81': 'Services aux bâtiments',
    '82': 'Services administratifs',
    '85': 'Enseignement',
    '86': 'Santé',
    '87': 'Hébergement médico-social',
    '88': 'Action sociale',
    '90': 'Arts et spectacles',
    '91': 'Bibliothèques et musées',
    '92': 'Jeux de hasard',
    '93': 'Sports et loisirs',
    '94': 'Organisations associatives',
    '95': 'Réparation',
    '96': 'Services personnels',
  }

  return sectorLabelsMap[sectorPrefix] || 'Secteur non classifié'
}
