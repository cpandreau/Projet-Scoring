'use server'

import { type AnnuaireEntreprise, fetchEntrepriseBySiren } from '@/lib/api/annuaire-entreprises'
import {
  type CompanyNames,
  extractCompanyNamesFromAnnuaire,
  fetchAllCompanyNames,
} from '@/lib/api/company-names'

/**
 * Récupère toutes les dénominations d'une entreprise depuis INPI + Annuaire
 * Version complète avec appel aux APIs
 */
export async function getCompanyNames(siren: string): Promise<CompanyNames | null> {
  if (!siren || siren.length !== 9) {
    console.error('[getCompanyNames] SIREN invalide:', siren)
    return null
  }

  return fetchAllCompanyNames(siren)
}

/**
 * Version légère qui extrait les noms depuis des données Annuaire déjà chargées
 * Utile quand on a déjà les données côté client
 */
export async function extractCompanyNamesFromCache(
  annuaireData: AnnuaireEntreprise | null
): Promise<CompanyNames | null> {
  return extractCompanyNamesFromAnnuaire(annuaireData)
}

/**
 * Récupère les dénominations avec fallback sur Annuaire si INPI indisponible
 * Retourne aussi les données Annuaire pour réutilisation
 */
export async function getCompanyNamesWithAnnuaire(siren: string): Promise<{
  names: CompanyNames | null
  annuaireData: AnnuaireEntreprise | null
}> {
  if (!siren || siren.length !== 9) {
    return { names: null, annuaireData: null }
  }

  // Récupérer les données Annuaire d'abord (toujours disponible)
  let annuaireData: AnnuaireEntreprise | null = null
  try {
    annuaireData = await fetchEntrepriseBySiren(siren)
  } catch (error) {
    console.error('[getCompanyNamesWithAnnuaire] Erreur Annuaire:', error)
  }

  // Récupérer toutes les dénominations (INPI + Annuaire)
  const names = await fetchAllCompanyNames(siren)

  return { names, annuaireData }
}
