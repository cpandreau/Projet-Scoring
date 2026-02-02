/**
 * Service de nomenclature NAF Rev. 2
 * Source officielle : API INSEE Métadonnées
 * https://api.insee.fr/metadonnees/V1/codes/nafr2
 */

const INSEE_NAF_API = 'https://api.insee.fr/metadonnees/V1/codes/nafr2'

export interface NafInfo {
  code: string
  label: string
  keywords: string[]
  source: 'insee_api' | 'static_mapping' | 'fallback'
}

// Cache en mémoire (les libellés NAF ne changent jamais)
const nafCache = new Map<string, NafInfo>()

/**
 * Normalise un code NAF (ajoute le point si absent)
 * "9602A" → "96.02A"
 */
export function normalizeNafCode(nafCode: string): string {
  if (!nafCode) return ''
  const clean = nafCode.trim().toUpperCase()
  if (clean.includes('.')) return clean
  if (clean.length >= 4) {
    return `${clean.slice(0, 2)}.${clean.slice(2)}`
  }
  return clean
}

/**
 * Récupère les informations NAF complètes (libellé + mots-clés)
 */
export async function getNafInfo(nafCode: string): Promise<NafInfo> {
  if (!nafCode) {
    return {
      code: '',
      label: 'Activité non définie',
      keywords: ['économie France', 'entreprises'],
      source: 'fallback',
    }
  }

  const normalized = normalizeNafCode(nafCode)

  // Vérifier le cache
  const cached = nafCache.get(normalized)
  if (cached) {
    console.log(`[NAF] Cache hit: ${normalized}`)
    return cached
  }

  // 1. Essayer l'API INSEE
  const inseeResult = await fetchFromInsee(normalized)
  if (inseeResult) {
    nafCache.set(normalized, inseeResult)
    return inseeResult
  }

  // 2. Fallback : mapping statique enrichi
  const staticResult = getFromStaticMapping(normalized)
  if (staticResult) {
    nafCache.set(normalized, staticResult)
    return staticResult
  }

  // 3. Fallback ultime
  const fallback: NafInfo = {
    code: normalized,
    label: 'Activité non classée',
    keywords: ['économie France', 'entreprises françaises'],
    source: 'fallback',
  }
  nafCache.set(normalized, fallback)
  return fallback
}

/**
 * Récupère le libellé depuis l'API INSEE Métadonnées
 */
async function fetchFromInsee(nafCode: string): Promise<NafInfo | null> {
  try {
    console.log(`[NAF] Fetching INSEE: ${nafCode}`)

    const response = await fetch(`${INSEE_NAF_API}/sousClasse/${nafCode}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 * 30 }, // Cache 30 jours
    })

    if (!response.ok) {
      console.warn(`[NAF] INSEE 404: ${nafCode}`)
      return null
    }

    const data = await response.json()
    const label = data.intitule as string

    console.log(`[NAF] INSEE success: ${nafCode} → "${label}"`)

    return {
      code: nafCode,
      label,
      keywords: generateKeywordsFromLabel(label, nafCode),
      source: 'insee_api',
    }
  } catch (error) {
    console.error('[NAF] INSEE error:', error)
    return null
  }
}

/**
 * Génère des mots-clés pertinents à partir du libellé officiel
 */
function generateKeywordsFromLabel(label: string, _nafCode: string): string[] {
  const labelLower = label.toLowerCase()
  const keywords: string[] = [labelLower]

  // Mapping des variantes courantes par mot-clé détecté
  const variantsMap: Record<string, string[]> = {
    // Services personnels
    coiffure: ['coiffeur', 'salon de coiffure', 'cheveux'],
    'soins de beauté': ['esthétique', 'institut de beauté', 'esthéticienne'],
    'entretien corporel': ['spa', 'hammam', 'bien-être', 'massage'],

    // Restauration
    'restauration traditionnelle': ['restaurant', 'restaurateur', 'gastronomie'],
    'restauration rapide': ['fast-food', 'snack', 'burger'],
    'débits de boissons': ['bar', 'café', 'pub'],
    traiteurs: ['traiteur', 'événementiel', 'réception'],

    // Commerce
    boulangerie: ['boulanger', 'pain', 'viennoiserie'],
    boucherie: ['boucher', 'viande'],
    pharmacie: ['pharmacien', 'officine', 'médicaments'],
    fleuriste: ['fleurs', 'bouquet'],

    // Informatique
    'programmation informatique': ['développeur', 'développement logiciel', 'code', 'tech'],
    'conseil en systèmes': ['ESN', 'SSII', 'consulting IT', 'transformation digitale'],
    'tierce maintenance': ['infogérance', 'support IT', 'maintenance informatique'],

    // Construction
    'construction de maisons': ['constructeur maison', 'maison individuelle'],
    'travaux de peinture': ['peintre bâtiment', 'peinture'],
    'travaux de plomberie': ['plombier', 'chauffagiste', 'plomberie'],
    "travaux d'installation électrique": ['électricien', 'électricité'],
    'travaux de menuiserie': ['menuisier', 'menuiserie'],
    'travaux de couverture': ['couvreur', 'toiture'],

    // Immobilier
    'agences immobilières': ['agent immobilier', 'immobilier', 'transaction'],
    'location de logements': ['bailleur', 'location appartement', 'gestion locative'],

    // Santé
    'médecins généralistes': ['médecin', 'généraliste', 'consultation'],
    'pratique dentaire': ['dentiste', 'chirurgien-dentiste'],
    'activités des infirmiers': ['infirmier', 'soins infirmiers'],
    kinésithérapeute: ['kiné', 'rééducation', 'kinésithérapie'],

    // Transport
    'transports routiers': ['transport', 'camion', 'logistique'],
    taxis: ['taxi', 'VTC', 'transport personnes'],
    déménagement: ['déménageur', 'déménagement'],

    // Comptabilité / Juridique
    'activités comptables': ['expert-comptable', 'comptabilité', 'comptable'],
    'activités juridiques': ['avocat', 'juridique', 'cabinet'],

    // Formation
    'formation continue': ['formation professionnelle', 'organisme formation'],
    'enseignement de la conduite': ['auto-école', 'permis'],
  }

  // Ajouter les variantes correspondantes
  for (const [key, variants] of Object.entries(variantsMap)) {
    if (labelLower.includes(key)) {
      keywords.push(...variants)
      break // Une seule correspondance suffit
    }
  }

  // Si pas de variantes trouvées, extraire les mots significatifs du libellé
  if (keywords.length === 1) {
    const words = labelLower
      .split(/[\s,'-]+/)
      .filter((w) => w.length > 3)
      .filter((w) => !['activités', 'autres', 'services', 'commerce', 'détail', 'gros'].includes(w))

    keywords.push(...words.slice(0, 2))
  }

  // Retourner max 4 mots-clés uniques
  return [...new Set(keywords)].slice(0, 4)
}

/**
 * Mapping statique pour les cas où l'API échoue
 * (subset des codes les plus courants)
 */
function getFromStaticMapping(nafCode: string): NafInfo | null {
  const code = nafCode.replace('.', '')

  const staticMap: Record<string, { label: string; keywords: string[] }> = {
    // Top 50 des codes NAF les plus fréquents
    '9602A': { label: 'Coiffure', keywords: ['coiffure', 'coiffeur', 'salon de coiffure'] },
    '9602B': { label: 'Soins de beauté', keywords: ['esthétique', 'institut de beauté', 'soins'] },
    '9604Z': { label: 'Entretien corporel', keywords: ['spa', 'hammam', 'bien-être', 'massage'] },
    '9601A': {
      label: 'Blanchisserie-teinturerie de gros',
      keywords: ['blanchisserie', 'pressing professionnel'],
    },
    '9601B': {
      label: 'Blanchisserie-teinturerie de détail',
      keywords: ['pressing', 'laverie', 'nettoyage'],
    },
    '5610A': {
      label: 'Restauration traditionnelle',
      keywords: ['restaurant', 'restauration', 'gastronomie'],
    },
    '5610C': {
      label: 'Restauration rapide',
      keywords: ['fast-food', 'restauration rapide', 'snack'],
    },
    '5630Z': { label: 'Débits de boissons', keywords: ['bar', 'café', 'pub', 'boissons'] },
    '4771Z': {
      label: "Commerce de détail d'habillement",
      keywords: ['prêt-à-porter', 'vêtements', 'mode'],
    },
    '6201Z': {
      label: 'Programmation informatique',
      keywords: ['développement logiciel', 'programmation', 'tech'],
    },
    '6202A': {
      label: 'Conseil en systèmes informatiques',
      keywords: ['ESN', 'SSII', 'consulting IT'],
    },
    '6202B': {
      label: 'Tierce maintenance informatique',
      keywords: ['infogérance', 'support IT', 'maintenance'],
    },
    '6311Z': { label: 'Traitement de données', keywords: ['data', 'hébergement', 'cloud'] },
    '6831Z': {
      label: 'Agences immobilières',
      keywords: ['agence immobilière', 'agent immobilier', 'immobilier'],
    },
    '6820A': {
      label: 'Location de logements',
      keywords: ['bailleur', 'location', 'gestion locative'],
    },
    '6920Z': {
      label: 'Activités comptables',
      keywords: ['expert-comptable', 'comptabilité', 'comptable'],
    },
    '6910Z': { label: 'Activités juridiques', keywords: ['avocat', 'juridique', 'cabinet avocat'] },
    '4520A': {
      label: 'Entretien et réparation automobiles',
      keywords: ['garage', 'réparation auto', 'mécanique'],
    },
    '4511Z': {
      label: 'Commerce de voitures',
      keywords: ['concessionnaire', 'automobile', 'voiture'],
    },
    '4321A': {
      label: "Travaux d'installation électrique",
      keywords: ['électricien', 'électricité', 'installation'],
    },
    '4322A': { label: 'Travaux de plomberie', keywords: ['plombier', 'plomberie', 'chauffagiste'] },
    '4334Z': {
      label: 'Travaux de peinture',
      keywords: ['peintre', 'peinture bâtiment', 'décoration'],
    },
    '4332A': { label: 'Travaux de menuiserie bois', keywords: ['menuisier', 'menuiserie', 'bois'] },
    '4391A': { label: 'Travaux de charpente', keywords: ['charpentier', 'charpente', 'bois'] },
    '4391B': { label: 'Travaux de couverture', keywords: ['couvreur', 'toiture', 'couverture'] },
    '4120A': {
      label: 'Construction de maisons individuelles',
      keywords: ['constructeur maison', 'maison individuelle'],
    },
    '4120B': {
      label: "Construction d'autres bâtiments",
      keywords: ['construction', 'bâtiment', 'promoteur'],
    },
    '8559A': {
      label: "Formation continue d'adultes",
      keywords: ['formation', 'organisme formation', 'formation professionnelle'],
    },
    '8553Z': {
      label: 'Enseignement de la conduite',
      keywords: ['auto-école', 'permis', 'conduite'],
    },
    '8621Z': {
      label: 'Médecins généralistes',
      keywords: ['médecin', 'généraliste', 'consultation'],
    },
    '8622A': {
      label: 'Médecins spécialistes',
      keywords: ['spécialiste', 'médecin', 'consultation'],
    },
    '8623Z': {
      label: 'Pratique dentaire',
      keywords: ['dentiste', 'cabinet dentaire', 'orthodontie'],
    },
    '8690A': { label: 'Ambulances', keywords: ['ambulance', 'transport sanitaire'] },
    '8690D': { label: 'Activités des infirmiers', keywords: ['infirmier', 'soins', 'infirmière'] },
    '8690E': {
      label: 'Kinésithérapie',
      keywords: ['kiné', 'kinésithérapeute', 'rééducation'],
    },
    '1071C': {
      label: 'Boulangerie et boulangerie-pâtisserie',
      keywords: ['boulangerie', 'pâtisserie', 'boulanger'],
    },
    '4721Z': {
      label: 'Commerce de détail de fruits et légumes',
      keywords: ['primeur', 'fruits', 'légumes'],
    },
    '4722Z': {
      label: 'Commerce de détail de viandes',
      keywords: ['boucherie', 'boucher', 'viande'],
    },
    '4723Z': {
      label: 'Commerce de détail de poissons',
      keywords: ['poissonnerie', 'poissonnier', 'fruits de mer'],
    },
    '4773Z': {
      label: 'Commerce de produits pharmaceutiques',
      keywords: ['pharmacie', 'pharmacien', 'médicaments'],
    },
    '4776Z': {
      label: 'Commerce de fleurs',
      keywords: ['fleuriste', 'fleurs', 'bouquet'],
    },
    '4941A': {
      label: 'Transports routiers de fret interurbains',
      keywords: ['transport routier', 'camion', 'fret'],
    },
    '4932Z': { label: 'Transports de voyageurs par taxis', keywords: ['taxi', 'VTC', 'chauffeur'] },
    '7311Z': {
      label: 'Activités des agences de publicité',
      keywords: ['publicité', 'agence', 'marketing'],
    },
    '7010Z': {
      label: 'Activités des sièges sociaux',
      keywords: ['holding', 'siège social', 'direction'],
    },
    '7022Z': { label: 'Conseil en gestion', keywords: ['conseil', 'consulting', 'management'] },
    '7111Z': {
      label: "Activités d'architecture",
      keywords: ['architecte', 'architecture', 'cabinet'],
    },
    '7112B': { label: 'Ingénierie', keywords: ['ingénierie', 'bureau études', 'technique'] },
    '7820Z': {
      label: 'Activités des agences de travail temporaire',
      keywords: ['intérim', 'agence', 'emploi'],
    },
  }

  const entry = staticMap[code]
  if (entry) {
    return {
      code: nafCode,
      label: entry.label,
      keywords: entry.keywords,
      source: 'static_mapping',
    }
  }

  return null
}

/**
 * Récupère uniquement les mots-clés (pour compatibilité)
 */
export async function getSectorKeywords(nafCode: string): Promise<string[]> {
  const info = await getNafInfo(nafCode)
  return info.keywords
}

/**
 * Récupère uniquement le libellé (pour compatibilité)
 */
export async function getNafLabel(nafCode: string): Promise<string> {
  const info = await getNafInfo(nafCode)
  return info.label
}

/**
 * Vide le cache NAF (pour les tests)
 */
export function clearNafCache(): void {
  nafCache.clear()
  console.log('[NAF] Cache cleared')
}
