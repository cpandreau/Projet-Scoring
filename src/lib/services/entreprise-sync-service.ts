import {
  fetchINPICompanyInfo,
  type INPICompanyInfoStructured,
  syncINPIToDatabase,
} from '@/actions/inpi'
import { searchSirene } from '@/actions/sirene.actions'
import { createClient } from '@/lib/supabase/server'
import type { Enterprise, SireneResult } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

export interface SyncEntrepriseResult {
  success: boolean
  sources: {
    insee: boolean
    inpi: boolean
  }
  error?: string
  syncedAt?: string
}

export interface RefreshCheckResult {
  needsRefresh: boolean
  reason: 'never_synced' | 'cache_expired' | 'observations_stale' | null
}

export type FreshnessStatus = 'fresh' | 'stale' | 'outdated' | 'never'

export interface DataFreshnessResult {
  status: FreshnessStatus
  inpiSyncAt: Date | null
  inseeSyncAt: Date | null
  message: string
}

// ============================================================================
// CONSTANTS - Cache parameters
// ============================================================================

/** Cache identity data for 7 days */
const CACHE_IDENTITE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/** Minimum interval between refreshes to avoid spam */
const MIN_REFRESH_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

/** Fresh data threshold (less than 24 hours) */
const FRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24 hours

/** Stale data threshold (between 24 hours and 7 days) */
const STALE_THRESHOLD_MS = CACHE_IDENTITE_MS // 7 days

// ============================================================================
// MAIN SYNC FUNCTION
// ============================================================================

/**
 * Synchronizes enterprise data from multiple sources (INSEE/SIRENE + INPI)
 *
 * Priority rules:
 * - SIREN, SIRET, code NAF: INSEE takes priority (national reference)
 * - Denomination, address, capital, directors, object social: INPI takes priority (daily updates vs monthly)
 */
export async function syncEntreprise(
  siren: string,
  dossierId: string
): Promise<SyncEntrepriseResult> {
  // Validate SIREN format
  const cleanSiren = siren.replace(/\s/g, '')
  if (!/^\d{9}$/.test(cleanSiren)) {
    return {
      success: false,
      sources: { insee: false, inpi: false },
      error: 'Le SIREN doit contenir exactement 9 chiffres',
    }
  }

  const now = new Date().toISOString()

  // Call both APIs in parallel with Promise.allSettled for graceful error handling
  const [inseeResult, inpiResult] = await Promise.allSettled([
    searchSirene(cleanSiren),
    fetchINPICompanyInfo(cleanSiren),
  ])

  // Process results
  const inseeSuccess: boolean =
    inseeResult.status === 'fulfilled' &&
    !inseeResult.value.error &&
    inseeResult.value.results !== undefined &&
    inseeResult.value.results.length > 0

  const inpiSuccess: boolean =
    inpiResult.status === 'fulfilled' &&
    inpiResult.value.success === true &&
    inpiResult.value.data !== undefined

  // If both sources failed, return error
  if (!inseeSuccess && !inpiSuccess) {
    const errors: string[] = []
    if (inseeResult.status === 'rejected') {
      errors.push(`INSEE: ${inseeResult.reason}`)
    } else if (inseeResult.status === 'fulfilled' && inseeResult.value.error) {
      errors.push(`INSEE: ${inseeResult.value.error}`)
    }
    if (inpiResult.status === 'rejected') {
      errors.push(`INPI: ${inpiResult.reason}`)
    } else if (
      inpiResult.status === 'fulfilled' &&
      !inpiResult.value.success &&
      inpiResult.value.error
    ) {
      errors.push(`INPI: ${inpiResult.value.error}`)
    }

    return {
      success: false,
      sources: { insee: false, inpi: false },
      error: errors.join('; ') || 'Aucune source de données disponible',
    }
  }

  try {
    const supabase = await createClient()

    // Extract data from results
    const inseeData: SireneResult | null =
      inseeSuccess && inseeResult.status === 'fulfilled' && inseeResult.value.results
        ? inseeResult.value.results[0]
        : null

    const inpiData: INPICompanyInfoStructured | null =
      inpiSuccess && inpiResult.status === 'fulfilled' && inpiResult.value.data
        ? inpiResult.value.data
        : null

    // Build the merged data object
    const mergedData = buildMergedData(inseeData, inpiData, now)

    // Update the dossiers table with merged data
    const { error: updateError } = await supabase
      .from('dossiers')
      .update(mergedData)
      .eq('id', dossierId)

    if (updateError) {
      console.error('Error updating dossier with merged data:', updateError)
      return {
        success: false,
        sources: { insee: inseeSuccess, inpi: inpiSuccess },
        error: `Erreur lors de la mise à jour: ${updateError.message}`,
      }
    }

    // If INPI data is available, sync the related tables
    if (inpiSuccess) {
      const inpiSyncResult = await syncINPIToDatabase(dossierId, cleanSiren)
      if (!inpiSyncResult.success) {
        console.warn('INPI related tables sync failed:', inpiSyncResult.message)
        // Don't fail the whole sync, just warn
      }
    }

    return {
      success: true,
      sources: { insee: inseeSuccess, inpi: inpiSuccess },
      syncedAt: now,
    }
  } catch (error) {
    console.error('[syncEntreprise] Error during sync:', error)
    return {
      success: false,
      sources: { insee: inseeSuccess, inpi: inpiSuccess },
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la synchronisation',
    }
  }
}

// ============================================================================
// MERGE DATA FUNCTION
// ============================================================================

/**
 * Builds merged data from INSEE and INPI sources
 *
 * Priority rules:
 * - INSEE for: SIREN, SIRET, code_naf (national reference, official)
 * - INPI for: Everything else (daily updates vs monthly INSEE updates)
 */
function buildMergedData(
  insee: SireneResult | null,
  inpi: INPICompanyInfoStructured | null,
  syncTime: string
): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  // === INSEE priority fields (national reference) ===
  if (insee) {
    data.siren = insee.siren
    data.siret = insee.siret
    data.code_naf = insee.code_naf
    data.insee_sync_at = syncTime

    // Fallback values if INPI not available
    if (!inpi) {
      data.raison_sociale = insee.raison_sociale
      data.forme_juridique = insee.forme_juridique
      data.adresse = insee.adresse
    }
  }

  // === INPI priority fields (more detailed and frequently updated) ===
  if (inpi) {
    data.inpi_sync_at = syncTime

    // Identity
    if (inpi.denomination) data.raison_sociale = inpi.denomination
    if (inpi.sigle) data.sigle = inpi.sigle
    if (inpi.nomCommercial) data.nom_commercial = inpi.nomCommercial

    // Legal form - use INPI libelle which is more readable
    if (inpi.formeJuridique) {
      data.forme_juridique = inpi.formeJuridique.libelle
      data.code_forme_juridique = inpi.formeJuridique.code
    }

    // Capital
    if (inpi.capital) {
      if (inpi.capital.montant !== undefined) data.capital = inpi.capital.montant
      if (inpi.capital.devise) data.devise_capital = inpi.capital.devise
      if (inpi.capital.variable !== undefined) data.capital_variable = inpi.capital.variable
    }

    // Dates
    if (inpi.dateCreation) data.date_creation = inpi.dateCreation
    if (inpi.dateClotureExerciceSocial) data.date_cloture_exercice = inpi.dateClotureExerciceSocial

    // Objet social
    if (inpi.objetSocial) data.objet_social = inpi.objetSocial

    // Address - INPI has more detailed address fields
    if (inpi.adresseSiege) {
      const addr = inpi.adresseSiege
      if (addr.adresseComplete) data.adresse = addr.adresseComplete
      if (addr.codePostal) data.code_postal = addr.codePostal
      if (addr.commune) data.ville = addr.commune
      if (addr.codePays) data.code_pays = addr.codePays
      if (addr.typeVoie) data.type_voie = addr.typeVoie
      if (addr.libelleVoie) data.libelle_voie = addr.libelleVoie
      if (addr.numeroVoie) data.num_voie = addr.numeroVoie
      if (addr.indiceRepetition) data.indice_repetition = addr.indiceRepetition
      if (addr.distributionSpeciale) data.distribution_speciale = addr.distributionSpeciale
      if (addr.complementLocalisation) data.complement_localisation = addr.complementLocalisation
      if (addr.codeInseeCommune) data.code_insee_commune = addr.codeInseeCommune
    }

    // Full data fields from INPI
    if (inpi.fullData) {
      const fd = inpi.fullData

      // Objet social (fallback if not at root level)
      if (fd.objetSocial && !data.objet_social) data.objet_social = fd.objetSocial
      if (fd.duree) data.duree_societe = fd.duree

      // Dates
      if (fd.dateDebutActivite) data.date_debut_activite = fd.dateDebutActivite
      if (fd.dateImmatriculation) data.date_immatriculation = fd.dateImmatriculation

      // Characteristics
      if (fd.ess !== undefined) data.ess = fd.ess
      if (fd.societeMission !== undefined) data.societe_mission = fd.societeMission
      if (fd.microEntreprise !== undefined) data.micro_entreprise = fd.microEntreprise
      if (fd.eirl !== undefined) data.eirl = fd.eirl
      if (fd.societeEtrangere !== undefined) data.societe_etrangere = fd.societeEtrangere
      if (fd.entrepriseAgricole !== undefined) data.entreprise_agricole = fd.entrepriseAgricole
      if (fd.indicateurAssocieUnique !== undefined) data.associe_unique = fd.indicateurAssocieUnique
      if (fd.indicateurOrigineFusionScission !== undefined)
        data.origine_fusion_scission = fd.indicateurOrigineFusionScission

      // Diffusion
      if (fd.diffusionINSEE) data.diffusion_insee = fd.diffusionINSEE
      if (fd.diffusionCommerciale !== undefined)
        data.diffusion_commerciale = fd.diffusionCommerciale
      if (fd.typePersonne) data.type_personne = fd.typePersonne

      // Établissement principal
      if (fd.etablissementPrincipal) {
        const ep = fd.etablissementPrincipal
        if (ep.siret) data.siret_siege = ep.siret
        if (ep.nic) data.nic_siege = ep.nic
        if (ep.codeApe) data.code_ape_siege = ep.codeApe
        if (ep.activiteNonSedentaire !== undefined)
          data.activite_non_sedentaire = ep.activiteNonSedentaire
      }

      // Registres
      if (fd.registres) {
        const reg = fd.registres
        if (reg.rncsPresent !== undefined) data.inscrit_rncs = reg.rncsPresent
        if (reg.rnmPresent !== undefined) data.inscrit_rnm = reg.rnmPresent
        if (reg.raaPresent !== undefined) data.inscrit_raa = reg.raaPresent
        if (reg.rncsDateImmatriculation) data.date_inscription_rncs = reg.rncsDateImmatriculation
      }

      // INPI metadata
      if (fd.idINPI) data.inpi_id = fd.idINPI
      if (fd.updatedAt) data.inpi_updated_at = fd.updatedAt
      if (fd.nombreRepresentantsActifs !== undefined)
        data.nombre_representants_actifs = fd.nombreRepresentantsActifs
      if (fd.nombreEtablissementsOuverts !== undefined)
        data.nombre_etablissements_ouverts = fd.nombreEtablissementsOuverts
    }

    // If no INSEE data, use INPI SIREN
    if (!insee) {
      data.siren = inpi.siren
    }
  }

  return data
}

// ============================================================================
// CACHE / REFRESH CHECK FUNCTIONS
// ============================================================================

/**
 * Determines if a dossier needs to be refreshed based on sync timestamps
 */
export function shouldRefreshDossier(dossier: Enterprise): RefreshCheckResult {
  const now = Date.now()

  // If never synced with INPI, needs refresh
  if (!dossier.inpi_sync_at) {
    return {
      needsRefresh: true,
      reason: 'never_synced',
    }
  }

  const lastSyncTime = new Date(dossier.inpi_sync_at).getTime()
  const timeSinceSync = now - lastSyncTime

  // If synced less than MIN_REFRESH_INTERVAL ago, don't refresh (avoid spam)
  if (timeSinceSync < MIN_REFRESH_INTERVAL_MS) {
    return {
      needsRefresh: false,
      reason: null,
    }
  }

  // If synced more than CACHE_IDENTITE ago (7 days), needs refresh
  if (timeSinceSync > CACHE_IDENTITE_MS) {
    return {
      needsRefresh: true,
      reason: 'cache_expired',
    }
  }

  // Otherwise, data is still considered fresh enough
  return {
    needsRefresh: false,
    reason: null,
  }
}

// ============================================================================
// DATA FRESHNESS FUNCTION
// ============================================================================

/**
 * Returns the freshness status of the dossier data with human-readable messages
 */
export function getDataFreshness(dossier: Enterprise): DataFreshnessResult {
  const inpiSyncAt = dossier.inpi_sync_at ? new Date(dossier.inpi_sync_at) : null
  const inseeSyncAt = dossier.insee_sync_at ? new Date(dossier.insee_sync_at) : null

  // Use the most recent sync time for status
  const mostRecentSync = getMostRecentDate(inpiSyncAt, inseeSyncAt)

  // Never synced
  if (!mostRecentSync) {
    return {
      status: 'never',
      inpiSyncAt,
      inseeSyncAt,
      message: 'Jamais synchronisé',
    }
  }

  const now = Date.now()
  const timeSinceSync = now - mostRecentSync.getTime()

  // Fresh: sync < 24h
  if (timeSinceSync < FRESH_THRESHOLD_MS) {
    return {
      status: 'fresh',
      inpiSyncAt,
      inseeSyncAt,
      message: 'Données à jour',
    }
  }

  // Stale: sync between 24h and 7 days
  if (timeSinceSync < STALE_THRESHOLD_MS) {
    const daysAgo = Math.floor(timeSinceSync / (24 * 60 * 60 * 1000))
    return {
      status: 'stale',
      inpiSyncAt,
      inseeSyncAt,
      message: `Données synchronisées il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`,
    }
  }

  // Outdated: sync > 7 days
  return {
    status: 'outdated',
    inpiSyncAt,
    inseeSyncAt,
    message: 'Données obsolètes',
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Returns the most recent date between two dates (handles nulls)
 */
function getMostRecentDate(date1: Date | null, date2: Date | null): Date | null {
  if (!date1 && !date2) return null
  if (!date1) return date2
  if (!date2) return date1
  return date1 > date2 ? date1 : date2
}

/**
 * Formats a duration in milliseconds to a human-readable string
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000))
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))

  if (days > 0) {
    return `${days} jour${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`
  }
  return "moins d'une heure"
}
