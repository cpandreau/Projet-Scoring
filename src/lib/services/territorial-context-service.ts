import {
  getAvailableYears,
  getCreationsEntreprises,
  // Nouvelles fonctions
  getDemographieEntreprises,
  getEffectifsSecteur,
  getPibRegional,
  getRevenuMedian,
  getStockEntreprises,
  getTauxChomage,
  getYearLimits,
} from '@/lib/api/insee-melodi'
import { createClient } from '@/lib/supabase/server'
import { getRegionFromDepartement, getRegionName } from '@/lib/utils/geo-mapping'
import { getA21FromNAF } from '@/lib/utils/naf-aggregation'
import type {
  ContexteEconomique,
  CreationsParAnnee,
  DemographieEntreprises,
  IndicateursTerritoriaux,
  SanteSecteur,
  TendanceSecteur,
  TerritorialContext,
} from '@/types/territorial'

// Re-export pour usage dans les composants
export { getAvailableYears }

// ============================================================================
// CONSTANTS
// ============================================================================

/** Cache duration for territorial indicators (30 days) */
const CACHE_INDICATEURS_MS = 30 * 24 * 60 * 60 * 1000

/** Number of years to fetch for historical data */
const HISTORY_YEARS = 5

// ============================================================================
// DEPARTMENT DATA
// ============================================================================

interface DepartementInfo {
  nom: string
  region: { code: string; nom: string }
  population: number // Population approximative 2023
}

const DEPARTEMENTS: Record<string, DepartementInfo> = {
  '01': { nom: 'Ain', region: { code: '84', nom: 'Auvergne-Rhône-Alpes' }, population: 660000 },
  '02': { nom: 'Aisne', region: { code: '32', nom: 'Hauts-de-France' }, population: 530000 },
  '03': { nom: 'Allier', region: { code: '84', nom: 'Auvergne-Rhône-Alpes' }, population: 340000 },
  '06': {
    nom: 'Alpes-Maritimes',
    region: { code: '93', nom: "Provence-Alpes-Côte d'Azur" },
    population: 1090000,
  },
  '13': {
    nom: 'Bouches-du-Rhône',
    region: { code: '93', nom: "Provence-Alpes-Côte d'Azur" },
    population: 2040000,
  },
  '31': { nom: 'Haute-Garonne', region: { code: '76', nom: 'Occitanie' }, population: 1420000 },
  '33': { nom: 'Gironde', region: { code: '75', nom: 'Nouvelle-Aquitaine' }, population: 1640000 },
  '34': { nom: 'Hérault', region: { code: '76', nom: 'Occitanie' }, population: 1180000 },
  '38': { nom: 'Isère', region: { code: '84', nom: 'Auvergne-Rhône-Alpes' }, population: 1280000 },
  '44': {
    nom: 'Loire-Atlantique',
    region: { code: '52', nom: 'Pays de la Loire' },
    population: 1450000,
  },
  '59': { nom: 'Nord', region: { code: '32', nom: 'Hauts-de-France' }, population: 2610000 },
  '67': { nom: 'Bas-Rhin', region: { code: '44', nom: 'Grand Est' }, population: 1140000 },
  '68': { nom: 'Haut-Rhin', region: { code: '44', nom: 'Grand Est' }, population: 765000 },
  '69': { nom: 'Rhône', region: { code: '84', nom: 'Auvergne-Rhône-Alpes' }, population: 1880000 },
  '75': { nom: 'Paris', region: { code: '11', nom: 'Île-de-France' }, population: 2150000 },
  '77': {
    nom: 'Seine-et-Marne',
    region: { code: '11', nom: 'Île-de-France' },
    population: 1420000,
  },
  '78': { nom: 'Yvelines', region: { code: '11', nom: 'Île-de-France' }, population: 1450000 },
  '83': {
    nom: 'Var',
    region: { code: '93', nom: "Provence-Alpes-Côte d'Azur" },
    population: 1080000,
  },
  '91': { nom: 'Essonne', region: { code: '11', nom: 'Île-de-France' }, population: 1310000 },
  '92': {
    nom: 'Hauts-de-Seine',
    region: { code: '11', nom: 'Île-de-France' },
    population: 1620000,
  },
  '93': {
    nom: 'Seine-Saint-Denis',
    region: { code: '11', nom: 'Île-de-France' },
    population: 1650000,
  },
  '94': { nom: 'Val-de-Marne', region: { code: '11', nom: 'Île-de-France' }, population: 1410000 },
  '95': { nom: "Val-d'Oise", region: { code: '11', nom: 'Île-de-France' }, population: 1250000 },
}

// ============================================================================
// MAIN FUNCTION - Get Territorial Context
// ============================================================================

/**
 * Retrieves the complete territorial context for an enterprise
 */
export async function getTerritorialContext(
  _siren: string,
  codeNAF: string,
  codeDepartement: string,
  anneeReference?: number
): Promise<TerritorialContext | null> {
  // Extract A21 code from NAF using the official mapping
  const a21Result = getA21FromNAF(codeNAF)
  const codeNafA21 = a21Result?.code ?? 'ZZ'
  const libelleA21 = a21Result?.libelle ?? 'Activités non classées'

  // Get region code from department
  const codeRegion = getRegionFromDepartement(codeDepartement)
  const nomRegion = codeRegion ? getRegionName(codeRegion) : undefined

  // Get year limits from INSEE API
  const yearLimits = getYearLimits()

  // Use the requested year or default to most recent available
  const anneeCreations = anneeReference
    ? Math.min(anneeReference, yearLimits.creations.max)
    : yearLimits.creations.max
  const anneeStock = anneeReference
    ? Math.min(anneeReference, yearLimits.stocks.max)
    : yearLimits.stocks.max

  // Sources tracking
  const sources: Array<{ nom: string; dateMAJ: string }> = []

  // Get department info
  const deptInfo = getDepartementInfo(codeDepartement)

  // Fetch all data
  console.log(
    `[TerritorialContext] Fetching enriched data for ${codeDepartement}/${codeNafA21} (région: ${codeRegion})`
  )

  let indicateurs: IndicateursTerritoriaux

  try {
    // Build list of years to fetch for historical data
    const yearsToFetch: number[] = []
    for (let i = 0; i < HISTORY_YEARS; i++) {
      const year = anneeCreations - i
      if (year >= yearLimits.creations.min) {
        yearsToFetch.push(year)
      }
    }

    // Fetch all base data in parallel
    const [stockN, ...creationsResults] = await Promise.all([
      getStockEntreprises(codeDepartement, codeNafA21, anneeStock),
      ...yearsToFetch.map((year) => getCreationsEntreprises(codeDepartement, codeNafA21, year)),
    ])

    // Fetch additional data in parallel (new datasets)
    const [demographieData, effectifsData, chomageData, revenuData, pibData] = await Promise.all([
      codeRegion ? getDemographieEntreprises(codeRegion, codeNafA21, 2022) : Promise.resolve(null),
      getEffectifsSecteur(codeDepartement, codeNafA21, 2022),
      getTauxChomage(codeDepartement, 2022),
      getRevenuMedian(codeDepartement, 2021),
      codeRegion ? getPibRegional(codeRegion, 2022) : Promise.resolve(null),
    ])

    // Build historical creations data
    const historiqueCreations: CreationsParAnnee[] = []
    yearsToFetch.forEach((year, index) => {
      const creations = creationsResults[index]
      if (creations !== null) {
        historiqueCreations.push({ annee: year, creations })
      }
    })

    // Sort by year ascending
    historiqueCreations.sort((a, b) => a.annee - b.annee)

    // Get current year and previous year creations
    const creationsN = creationsResults[0] ?? null
    const creationsN1 = creationsResults[1] ?? null

    // Calculate evolution if we have both years
    let evolutionCreations: number | undefined
    if (creationsN !== null && creationsN1 !== null && creationsN1 > 0) {
      evolutionCreations = ((creationsN - creationsN1) / creationsN1) * 100
    }

    // Calculate sector health and trend
    const { santeSecteur, tendanceSecteur } = calculateSectorHealth(
      historiqueCreations,
      evolutionCreations
    )

    // Calculate density (enterprises per 10,000 inhabitants)
    const densitePour10000 =
      stockN !== null && deptInfo.population > 0
        ? Math.round((stockN / deptInfo.population) * 10000 * 10) / 10
        : undefined

    // Calculate taux de cessation if we have demographie and stock data
    let demographieRegion: DemographieEntreprises | undefined = demographieData ?? undefined
    if (demographieRegion && stockN !== null && stockN > 0) {
      demographieRegion = {
        ...demographieRegion,
        tauxCessation: (demographieRegion.cessations / stockN) * 100,
      }
    }

    // Build contexte economique
    const contexteEconomique: ContexteEconomique | undefined =
      chomageData || revenuData || pibData
        ? {
            tauxChomage: chomageData?.taux,
            anneeChomage: chomageData?.annee,
            revenuMedian: revenuData?.revenu,
            anneeRevenu: revenuData?.annee,
            pibRegional: pibData?.pib,
            anneePib: pibData?.annee,
          }
        : undefined

    // Build indicateurs with enriched data
    indicateurs = {
      nbEntreprisesSecteur: stockN ?? undefined,
      creationsAnnee: creationsN ?? undefined,
      evolutionCreations,
      defaillancesAnnee: undefined,
      evolutionDefaillances: undefined,
      tauxChomage: chomageData?.taux,
      revenusMedians: revenuData?.revenu,
      // Enriched data
      historiqueCreations: historiqueCreations.length > 0 ? historiqueCreations : undefined,
      totalEntreprisesDepartement: undefined,
      partSecteur: undefined,
      densitePour10000,
      moyenneNationaleCreations: undefined,
      santeSecteur,
      tendanceSecteur,
      // New INSEE data
      codeRegion: codeRegion ?? undefined,
      nomRegion: nomRegion ?? undefined,
      demographieRegion,
      effectifsSecteur: effectifsData ?? undefined,
      contexteEconomique,
    }

    // Add sources for data we received
    if (stockN !== null || creationsN !== null) {
      sources.push({ nom: 'INSEE Melodi - SIDE', dateMAJ: new Date().toISOString() })
    }
    if (demographieData) {
      sources.push({ nom: 'INSEE Melodi - EQDEMO', dateMAJ: new Date().toISOString() })
    }
    if (effectifsData) {
      sources.push({ nom: 'INSEE Melodi - FLORES', dateMAJ: new Date().toISOString() })
    }
    if (chomageData || revenuData) {
      sources.push({ nom: 'INSEE Melodi - RP/FILOSOFI', dateMAJ: new Date().toISOString() })
    }
    if (pibData) {
      sources.push({ nom: 'INSEE Melodi - Comptes régionaux', dateMAJ: new Date().toISOString() })
    }

    if (sources.length === 0) {
      console.warn(
        `[TerritorialContext] INSEE Melodi returned no data for ${codeDepartement}/${codeNafA21}`
      )
    }
  } catch (apiError) {
    console.warn('[TerritorialContext] INSEE Melodi API error:', apiError)
    indicateurs = {
      nbEntreprisesSecteur: undefined,
      creationsAnnee: undefined,
      evolutionCreations: undefined,
      defaillancesAnnee: undefined,
      evolutionDefaillances: undefined,
      tauxChomage: undefined,
      revenusMedians: undefined,
    }
  }

  const context: TerritorialContext = {
    localisation: {
      region: deptInfo.region,
      departement: {
        code: codeDepartement,
        nom: deptInfo.nom,
        population: deptInfo.population,
      },
      commune: undefined,
      zoneEmploi: undefined,
    },
    secteur: {
      codeNAF: codeNAF,
      libelleNAF: getLibelleNAF(codeNAF),
      codeA21: codeNafA21,
      libelleA21,
    },
    indicateurs,
    sources,
    dateCalcul: new Date().toISOString(),
  }

  return context
}

// ============================================================================
// HEALTH CALCULATION
// ============================================================================

/**
 * Calculates sector health and trend from historical data
 */
function calculateSectorHealth(
  historiqueCreations: CreationsParAnnee[],
  evolutionCreations?: number
): { santeSecteur?: SanteSecteur; tendanceSecteur?: TendanceSecteur } {
  if (historiqueCreations.length < 2) {
    return {}
  }

  // Calculate average evolution over available years
  let totalEvolution = 0
  let evolutionCount = 0

  for (let i = 1; i < historiqueCreations.length; i++) {
    const prev = historiqueCreations[i - 1].creations
    const curr = historiqueCreations[i].creations
    if (prev > 0) {
      totalEvolution += ((curr - prev) / prev) * 100
      evolutionCount++
    }
  }

  const avgEvolution = evolutionCount > 0 ? totalEvolution / evolutionCount : 0

  // Determine sector health based on recent evolution
  let santeSecteur: SanteSecteur | undefined
  if (evolutionCreations !== undefined) {
    if (evolutionCreations > 5) {
      santeSecteur = 'dynamique'
    } else if (evolutionCreations < -5) {
      santeSecteur = 'difficulte'
    } else {
      santeSecteur = 'stable'
    }
  }

  // Determine trend based on average evolution over time
  let tendanceSecteur: TendanceSecteur | undefined
  if (avgEvolution > 2) {
    tendanceSecteur = 'croissance'
  } else if (avgEvolution < -2) {
    tendanceSecteur = 'declin'
  } else {
    tendanceSecteur = 'stable'
  }

  return { santeSecteur, tendanceSecteur }
}

// ============================================================================
// CACHE FUNCTIONS
// ============================================================================

/**
 * Retrieves cached territorial indicators from database
 */
export async function getCachedIndicateurs(
  codeDepartement: string,
  codeNafA21: string,
  annee: number
): Promise<IndicateursTerritoriaux | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('indicateurs_territoriaux')
      .select('*')
      .eq('code_departement', codeDepartement)
      .eq('code_naf_a21', codeNafA21)
      .eq('annee', annee)
      .single()

    if (error || !data) {
      return null
    }

    // Check if cache is still valid
    const updatedAt = new Date(data.updated_at).getTime()
    const now = Date.now()
    if (now - updatedAt > CACHE_INDICATEURS_MS) {
      return null
    }

    return {
      nbEntreprisesSecteur: data.nb_entreprises ?? undefined,
      creationsAnnee: data.nb_creations ?? undefined,
      evolutionCreations: data.evolution_creations ?? undefined,
      defaillancesAnnee: data.nb_defaillances ?? undefined,
      evolutionDefaillances: data.evolution_defaillances ?? undefined,
      tauxChomage: data.taux_chomage ?? undefined,
      revenusMedians: data.revenus_medians ?? undefined,
    }
  } catch (error) {
    console.error('[getCachedIndicateurs] Error:', error)
    return null
  }
}

/**
 * Saves or updates territorial indicators in cache
 */
export async function saveCachedIndicateurs(
  codeDepartement: string,
  codeNafA21: string,
  annee: number,
  data: IndicateursTerritoriaux,
  sources?: Array<{ nom: string; dateMAJ: string }>
): Promise<void> {
  try {
    const supabase = await createClient()

    const record = {
      code_departement: codeDepartement,
      code_naf_a21: codeNafA21,
      annee,
      nb_entreprises: data.nbEntreprisesSecteur,
      nb_creations: data.creationsAnnee,
      evolution_creations: data.evolutionCreations,
      nb_defaillances: data.defaillancesAnnee,
      evolution_defaillances: data.evolutionDefaillances,
      taux_chomage: data.tauxChomage,
      revenus_medians: data.revenusMedians ?? null,
      sources: sources ?? [],
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('indicateurs_territoriaux').upsert(record, {
      onConflict: 'code_departement,code_naf_a21,annee',
    })

    if (error) {
      console.error('[saveCachedIndicateurs] Error:', error)
      throw error
    }
  } catch (error) {
    console.error('[saveCachedIndicateurs] Error:', error)
    throw error
  }
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Returns department info including name, region and population
 */
function getDepartementInfo(code: string): DepartementInfo {
  return (
    DEPARTEMENTS[code] ?? {
      nom: `Département ${code}`,
      region: { code: '00', nom: 'Non déterminée' },
      population: 500000, // Default approximation
    }
  )
}

/**
 * Returns the NAF activity label
 */
function getLibelleNAF(codeNAF: string): string {
  const labels: Record<string, string> = {
    '4120A': 'Construction de maisons individuelles',
    '4120B': "Construction d'autres bâtiments",
    '4311Z': 'Travaux de démolition',
    '4321A': "Travaux d'installation électrique dans tous locaux",
    '4322A': "Travaux d'installation d'eau et de gaz en tous locaux",
    '4332A': 'Travaux de menuiserie bois et PVC',
    '4332B': 'Travaux de menuiserie métallique et serrurerie',
    '4333Z': 'Travaux de revêtement des sols et des murs',
    '4334Z': 'Travaux de peinture et vitrerie',
  }
  return labels[codeNAF] || `Activité ${codeNAF}`
}
