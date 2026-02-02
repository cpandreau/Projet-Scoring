'use server'

import { fetchEntrepriseBySiren } from '@/lib/api/annuaire-entreprises'

/**
 * Récupère les données officielles d'une entreprise via l'API Annuaire Entreprises
 */
export async function getAnnuaireData(siren: string) {
  if (!siren || siren.length !== 9) {
    return null
  }
  return fetchEntrepriseBySiren(siren)
}
