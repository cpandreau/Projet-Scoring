/**
 * Google Places API Service
 * Récupère la réputation client (note, avis) depuis Google Maps
 *
 * Documentation : https://developers.google.com/maps/documentation/places/web-service
 */

import { type AnnuaireEntreprise, extractAllNames } from './annuaire-entreprises'

const GOOGLE_PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'
const PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places'

// ============================================================================
// TYPES
// ============================================================================

export interface GoogleReview {
  authorName: string
  authorPhotoUrl?: string
  rating: number
  text: string
  relativeTime: string
  publishTime: string
}

export interface PlaceReputation {
  found: boolean
  placeId?: string
  placeName?: string
  placeAddress?: string
  rating?: number // Note moyenne (1-5)
  userRatingsTotal?: number // Nombre total d'avis
  priceLevel?: number // Niveau de prix (0-4)
  reviews?: GoogleReview[] // 5 derniers avis max
  googleMapsUrl?: string // Lien vers la fiche Google
  matchedName?: string // Nom qui a permis de trouver la fiche
  methodology: {
    source: string
    searchQuery: string
    searchedNames?: string[] // Tous les noms essayés
    matchedName?: string // Nom qui a matché
    fieldsRequested: string[]
    timestamp: string
  }
  error?: string
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Recherche la réputation Google d'une entreprise
 * Essaie tous les noms disponibles (enseigne, nom commercial, raison sociale)
 * et garde le meilleur résultat
 *
 * @param companyName - Nom principal de l'entreprise
 * @param city - Ville du siège (optionnel)
 * @param address - Adresse complète (optionnel)
 * @param annuaireData - Données Annuaire Entreprises (optionnel)
 * @param allNames - Liste complète des noms à essayer (prioritaire sur annuaireData)
 */
export async function getPlaceReputation(
  companyName: string,
  city?: string,
  address?: string,
  annuaireData?: AnnuaireEntreprise | null,
  allNames?: string[]
): Promise<PlaceReputation> {
  if (!GOOGLE_PLACES_API_KEY) {
    return {
      found: false,
      methodology: createMethodology('', [], []),
      error: 'Clé API Google Places non configurée',
    }
  }

  if (!companyName) {
    return {
      found: false,
      methodology: createMethodology('', [], []),
      error: "Nom d'entreprise manquant",
    }
  }

  // Construire la liste des noms à essayer (enseignes en priorité)
  // Si allNames est fourni (depuis company-names service), l'utiliser directement
  const namesToTry = allNames && allNames.length > 0
    ? allNames
    : buildNamesToTry(companyName, annuaireData)
  console.log(`[Google Places] Noms à essayer: ${namesToTry.join(', ')}`)

  // Essayer chaque nom et garder le meilleur résultat
  let bestResult: PlaceReputation | null = null
  let bestScore = 0
  let lastError: string | undefined

  for (const name of namesToTry) {
    try {
      const searchQuery = buildSearchQuery(name, city, address)
      console.log(`[Google Places] Essai avec "${name}"`)

      // Rechercher l'établissement
      const placeId = await findPlace(searchQuery)

      if (!placeId) {
        console.log(`[Google Places] Aucun résultat pour "${name}"`)
        continue
      }

      // Récupérer les détails
      const details = await getPlaceDetails(placeId)

      // Calculer un score de pertinence
      const score = calculatePlaceScore(details, address, city)
      console.log(
        `[Google Places] "${name}" → score ${score} (rating: ${details.rating}, avis: ${details.userRatingsTotal})`
      )

      // Garder le meilleur résultat
      if (score > bestScore) {
        bestScore = score
        bestResult = {
          found: true,
          placeId,
          ...details,
          matchedName: name,
          methodology: createMethodology(
            searchQuery,
            namesToTry,
            [
              'displayName',
              'formattedAddress',
              'rating',
              'userRatingCount',
              'priceLevel',
              'reviews',
              'googleMapsUri',
            ],
            name
          ),
        }
      }

      // Si on a un très bon score, pas besoin de continuer
      if (score >= 80) {
        console.log(`[Google Places] Score excellent (${score}), arrêt de la recherche`)
        break
      }
    } catch (error) {
      console.error(`[Google Places] Erreur recherche "${name}":`, error)
      lastError = error instanceof Error ? error.message : 'Erreur lors de la recherche'
    }
  }

  // Retourner le meilleur résultat ou une erreur
  if (bestResult) {
    return bestResult
  }

  return {
    found: false,
    methodology: createMethodology('', namesToTry, []),
    error: lastError || 'Établissement non trouvé sur Google Maps',
  }
}

/**
 * Construit la liste des noms à essayer, avec les enseignes en priorité
 */
function buildNamesToTry(companyName: string, annuaireData?: AnnuaireEntreprise | null): string[] {
  const namesToTry: string[] = []

  if (annuaireData) {
    // 1. Enseignes (nom visible sur la devanture) - priorité maximale
    const enseignes = annuaireData.siege?.liste_enseignes || []

    // 2. Nom commercial
    const nomCommercial = annuaireData.siege?.nom_commercial
    if (nomCommercial) {
      // Ajouter le nom commercial en premier s'il n'est pas déjà une enseigne
      if (!enseignes.includes(nomCommercial)) {
        namesToTry.push(nomCommercial)
      }
    }

    // Ajouter les enseignes (dédupliquées)
    for (const enseigne of enseignes) {
      if (!namesToTry.includes(enseigne)) {
        namesToTry.push(enseigne)
      }
    }

    // 3. Autres noms depuis extractAllNames (raison sociale, sigle)
    const allNames = extractAllNames(annuaireData)
    for (const name of allNames) {
      if (!namesToTry.includes(name)) {
        namesToTry.push(name)
      }
    }
  }

  // 4. Fallback sur le nom fourni en paramètre
  if (!namesToTry.includes(companyName)) {
    namesToTry.push(companyName)
  }

  return namesToTry
}

/**
 * Calcule un score de pertinence pour un résultat Places
 */
function calculatePlaceScore(
  result: Partial<PlaceReputation>,
  expectedAddress?: string,
  expectedCity?: string
): number {
  let score = 0

  // Avoir des avis = bon signe (+40 points)
  if (result.userRatingsTotal && result.userRatingsTotal > 0) {
    score += 40
    // Bonus si beaucoup d'avis
    if (result.userRatingsTotal >= 10) score += 10
    if (result.userRatingsTotal >= 50) score += 10
  }

  // Avoir une note = bon signe (+20 points)
  if (result.rating && result.rating > 0) {
    score += 20
  }

  // Adresse qui matche = très bon signe (+20 points)
  if (expectedAddress && result.placeAddress) {
    const normalizedExpected = normalizeAddress(expectedAddress)
    const normalizedResult = normalizeAddress(result.placeAddress)

    if (
      normalizedResult.includes(normalizedExpected) ||
      normalizedExpected.includes(normalizedResult)
    ) {
      score += 20
    }
  }

  // Ville qui matche (+10 points)
  if (expectedCity && result.placeAddress) {
    if (result.placeAddress.toLowerCase().includes(expectedCity.toLowerCase())) {
      score += 10
    }
  }

  return score
}

/**
 * Normalise une adresse pour comparaison
 */
function normalizeAddress(address: string): string {
  return address.toLowerCase().replace(/[,.-]/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Construire la requête de recherche optimale
 */
function buildSearchQuery(companyName: string, city?: string, address?: string): string {
  const parts = [companyName]

  if (address) {
    parts.push(address)
  }

  if (city) {
    parts.push(city)
  }

  parts.push('France')

  return parts.join(', ')
}

/**
 * Rechercher un établissement par texte (Text Search API)
 */
async function findPlace(query: string): Promise<string | null> {
  console.log(`[Google Places] Searching: "${query}"`)

  const response = await fetch(TEXT_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'fr',
      regionCode: 'FR',
      maxResultCount: 1,
    }),
    next: { revalidate: 86400 }, // Cache 24h
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Google Places] Search error: ${response.status}`, errorText)
    throw new Error(`Erreur API Google Places: ${response.status}`)
  }

  const data = await response.json()

  if (!data.places || data.places.length === 0) {
    console.log('[Google Places] No results found')
    return null
  }

  const place = data.places[0]
  console.log(`[Google Places] Found: ${place.displayName?.text} (${place.id})`)

  return place.id
}

/**
 * Récupérer les détails d'un établissement (Place Details API)
 */
async function getPlaceDetails(placeId: string): Promise<Partial<PlaceReputation>> {
  console.log(`[Google Places] Getting details for: ${placeId}`)

  const response = await fetch(`${PLACE_DETAILS_URL}/${placeId}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask': [
        'displayName',
        'formattedAddress',
        'rating',
        'userRatingCount',
        'priceLevel',
        'reviews',
        'googleMapsUri',
      ].join(','),
    },
    next: { revalidate: 86400 }, // Cache 24h
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Google Places] Details error: ${response.status}`, errorText)
    throw new Error(`Erreur API Google Places: ${response.status}`)
  }

  const data = await response.json()

  console.log(`[Google Places] Rating: ${data.rating}/5 (${data.userRatingCount} avis)`)

  return {
    placeName: data.displayName?.text,
    placeAddress: data.formattedAddress,
    rating: data.rating,
    userRatingsTotal: data.userRatingCount,
    priceLevel: parsePriceLevel(data.priceLevel),
    reviews: parseReviews(data.reviews),
    googleMapsUrl: data.googleMapsUri,
  }
}

/**
 * Parser le niveau de prix
 */
function parsePriceLevel(priceLevel?: string): number | undefined {
  if (!priceLevel) return undefined

  const levels: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }

  return levels[priceLevel]
}

interface PlacesReview {
  authorAttribution?: {
    displayName?: string
    photoUri?: string
  }
  rating?: number
  text?: {
    text?: string
  }
  relativePublishTimeDescription?: string
  publishTime?: string
}

/**
 * Parser les avis
 */
function parseReviews(reviews?: PlacesReview[]): GoogleReview[] {
  if (!reviews || !Array.isArray(reviews)) return []

  return reviews.slice(0, 5).map((review) => ({
    authorName: review.authorAttribution?.displayName || 'Anonyme',
    authorPhotoUrl: review.authorAttribution?.photoUri,
    rating: review.rating || 0,
    text: review.text?.text || '',
    relativeTime: review.relativePublishTimeDescription || '',
    publishTime: review.publishTime || '',
  }))
}

/**
 * Créer les métadonnées de méthodologie
 */
function createMethodology(
  searchQuery: string,
  searchedNames: string[],
  fields: string[],
  matchedName?: string
) {
  return {
    source: 'Google Places API (New)',
    searchQuery,
    searchedNames: searchedNames.length > 0 ? searchedNames : undefined,
    matchedName,
    fieldsRequested: fields,
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formater le niveau de prix pour l'affichage
 */
export function formatPriceLevel(level?: number): string {
  if (level === undefined || level === null) return 'Non renseigné'
  if (level === 0) return 'Gratuit'
  return '\u20AC'.repeat(level) // € symbol
}

/**
 * Formater la note avec étoiles (texte)
 */
export function formatRatingStars(rating?: number): string {
  if (!rating) return '\u2606\u2606\u2606\u2606\u2606' // ☆☆☆☆☆
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5 ? 1 : 0
  const emptyStars = 5 - fullStars - halfStar
  return '\u2605'.repeat(fullStars) + (halfStar ? '\u00BD' : '') + '\u2606'.repeat(emptyStars)
}
