'use server'

import type { AnnuaireEntreprise } from '@/lib/api/annuaire-entreprises'
import { getPlaceReputation } from '@/lib/api/google-places'

/**
 * Récupère la réputation Google d'une entreprise (note, avis)
 * Utilise tous les noms disponibles (enseigne, nom commercial, raison sociale)
 *
 * @param companyName - Nom principal de l'entreprise
 * @param city - Ville du siège (optionnel)
 * @param address - Adresse complète (optionnel)
 * @param annuaireData - Données Annuaire Entreprises (optionnel)
 * @param allNames - Liste complète des noms à essayer, depuis INPI+Annuaire (optionnel)
 */
export async function getEnterpriseReputation(
  companyName: string,
  city?: string,
  address?: string,
  annuaireData?: AnnuaireEntreprise | null,
  allNames?: string[]
) {
  return getPlaceReputation(companyName, city, address, annuaireData, allNames)
}
