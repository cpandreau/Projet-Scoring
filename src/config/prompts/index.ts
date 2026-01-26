/**
 * Index des prompts d'extraction pour les liasses fiscales
 * Défaillantomètre
 */

import type { TypeLiasse } from '@/types/document'
import { PROMPT_LIASSE_NORMALE } from './liasse-normale.prompt'
import { PROMPT_LIASSE_SIMPLIFIEE } from './liasse-simplifiee.prompt'

// Réexporter les prompts individuels
export { PROMPT_LIASSE_NORMALE } from './liasse-normale.prompt'
export { PROMPT_LIASSE_SIMPLIFIEE } from './liasse-simplifiee.prompt'

/**
 * Récupère le prompt d'extraction approprié selon le type de liasse
 * @param typeLiasse - Type de liasse fiscale ("normale" ou "simplifiee")
 * @returns Le prompt optimisé pour ce type de liasse
 */
export function getPromptForLiasse(typeLiasse: TypeLiasse): string {
  switch (typeLiasse) {
    case 'normale':
      return PROMPT_LIASSE_NORMALE
    case 'simplifiee':
      return PROMPT_LIASSE_SIMPLIFIEE
    default:
      // Fallback sur le prompt simplifié si type inconnu
      console.warn(
        `Type de liasse inconnu: ${typeLiasse}, utilisation du prompt simplifié par défaut`
      )
      return PROMPT_LIASSE_SIMPLIFIEE
  }
}

/**
 * Vérifie si un type de liasse est valide
 * @param typeLiasse - Type à vérifier
 * @returns true si le type est valide
 */
export function isValidTypeLiasse(typeLiasse: string | null | undefined): typeLiasse is TypeLiasse {
  return typeLiasse === 'normale' || typeLiasse === 'simplifiee'
}
