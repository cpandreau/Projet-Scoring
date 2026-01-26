'use server'

import {
  getBilanSaisi,
  getCompanyAttachments,
  type INPIError,
  isINPIConfigured,
} from '@/lib/api/inpi-service'

import type { FetchINPIBilanDetailResult, FetchINPIBilansResult } from './inpi.types'

/**
 * Récupère la liste des bilans INPI disponibles pour un SIREN
 * Filtre uniquement les bilans publics (non confidentiels)
 */
export async function fetchINPIBilans(siren: string): Promise<FetchINPIBilansResult> {
  try {
    if (!isINPIConfigured()) {
      return {
        success: false,
        error: 'Service INPI non configuré',
      }
    }

    const sirenClean = siren.replace(/\s/g, '')
    if (!/^\d{9}$/.test(sirenClean)) {
      return {
        success: false,
        error: 'SIREN invalide (9 chiffres requis)',
      }
    }

    const attachments = await getCompanyAttachments(sirenClean)

    if (!attachments) {
      return {
        success: false,
        error: 'Aucune donnée trouvée pour ce SIREN',
      }
    }

    const bilansPublics = attachments.bilansSaisis
      .filter((bilan) => bilan.confidentialite !== 'Confidential')
      .map((bilan) => ({
        id: bilan.id,
        dateCloture: bilan.dateCloture,
        dateDepot: bilan.dateDepot,
        typeBilan: bilan.type,
        confidentialite: bilan.confidentialite,
      }))
      .sort((a, b) => b.dateCloture.localeCompare(a.dateCloture))

    return {
      success: true,
      data: {
        siren: sirenClean,
        bilans: bilansPublics,
      },
    }
  } catch (error) {
    const inpiError = error as INPIError

    if (inpiError.code === 'UNAUTHORIZED') {
      return {
        success: false,
        error: 'Authentification INPI échouée',
      }
    }

    if (inpiError.code === 'CONFIG_ERROR') {
      return {
        success: false,
        error: 'Service INPI non configuré',
      }
    }

    console.error('[INPI Actions] fetchINPIBilans error:', error)
    return {
      success: false,
      error: inpiError.message || 'Erreur lors de la récupération des bilans',
    }
  }
}

/**
 * Récupère les données détaillées d'un bilan INPI
 */
export async function fetchINPIBilanDetail(bilanId: string): Promise<FetchINPIBilanDetailResult> {
  try {
    if (!isINPIConfigured()) {
      return {
        success: false,
        error: 'Service INPI non configuré',
      }
    }

    if (!bilanId) {
      return {
        success: false,
        error: 'ID de bilan requis',
      }
    }

    const bilan = await getBilanSaisi(bilanId)

    if (!bilan) {
      return {
        success: false,
        error: 'Bilan non trouvé',
      }
    }

    return {
      success: true,
      data: bilan,
    }
  } catch (error) {
    const inpiError = error as INPIError

    if (inpiError.code === 'UNAUTHORIZED') {
      return {
        success: false,
        error: 'Authentification INPI échouée',
      }
    }

    if (inpiError.code === 'CONFIG_ERROR') {
      return {
        success: false,
        error: 'Service INPI non configuré',
      }
    }

    console.error('[INPI Actions] fetchINPIBilanDetail error:', error)
    return {
      success: false,
      error: inpiError.message || 'Erreur lors de la récupération du bilan',
    }
  }
}
