'use server'

import {
  getAvailableYears as getAvailableYearsService,
  getTerritorialContext as getTerritorialContextService,
} from '@/lib/services/territorial-context-service'
import type { TerritorialContext } from '@/types/territorial'

/**
 * Server action to fetch territorial context for an enterprise
 */
export async function fetchTerritorialContext(
  siren: string,
  codeNAF: string,
  codeDepartement: string,
  annee?: number
): Promise<{ data: TerritorialContext | null; error: string | null }> {
  try {
    const data = await getTerritorialContextService(siren, codeNAF, codeDepartement, annee)
    return { data, error: null }
  } catch (error) {
    console.error('[fetchTerritorialContext] Error:', error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération du contexte territorial',
    }
  }
}

/**
 * Server action to get available years for territorial data
 */
export async function getAvailableYears(): Promise<number[]> {
  return getAvailableYearsService()
}
