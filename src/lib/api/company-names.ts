/**
 * Service unifié pour récupérer toutes les dénominations d'une entreprise
 * Combine INPI (RNE) + Annuaire Entreprises pour une liste exhaustive
 */

import {
  type AnnuaireEntreprise,
  extractAllNames as extractAnnuaireNames,
  fetchEntrepriseBySiren,
} from './annuaire-entreprises'
import { getCompanyInfo, type INPICompanyInfo, isINPIConfigured } from './inpi-service'

// ============================================================================
// TYPES
// ============================================================================

export interface CompanyNames {
  // Nom principal
  raisonSociale: string

  // Noms alternatifs
  sigle: string | null
  nomCommercial: string | null
  enseignes: string[]

  // Liste consolidée pour recherche (dédupliquée)
  allNames: string[]

  // Sources utilisées
  sources: ('INPI' | 'ANNUAIRE')[]

  // Métadonnées
  lastUpdate: string
}

// ============================================================================
// EXTRACTION DEPUIS INPI
// ============================================================================

/**
 * Extrait les dénominations depuis les données INPI
 */
function extractINPIDenominations(data: INPICompanyInfo): {
  denomination: string | null
  sigle: string | null
  nomCommercial: string | null
  enseignes: string[]
} {
  const enseignes: string[] = []

  // Extraire depuis formality.content.personneMorale.identite.entreprise
  const entrepriseIdentite = data.formality?.content?.personneMorale?.identite?.entreprise
  const description = data.formality?.content?.personneMorale?.identite?.description

  // Pour les personnes physiques
  const personnePhysique = data.formality?.content?.personnePhysique

  let denomination: string | null = null
  let sigle: string | null = null
  let nomCommercial: string | null = null

  if (entrepriseIdentite) {
    denomination = entrepriseIdentite.denomination || null
    sigle = entrepriseIdentite.sigle || description?.sigle || null
    nomCommercial = entrepriseIdentite.nomCommercial || null
  }

  // Pour les entrepreneurs individuels
  if (personnePhysique?.identite?.entrepreneur?.descriptionPersonne) {
    const personne = personnePhysique.identite.entrepreneur.descriptionPersonne
    if (personne.nom) {
      const prenoms = personne.prenoms?.join(' ') || ''
      denomination = `${prenoms} ${personne.nom}`.trim()
      if (personne.nomUsage) {
        enseignes.push(personne.nomUsage)
      }
    }
  }

  // Collecter les enseignes depuis l'établissement principal
  // Note: L'API INPI ne retourne pas directement les enseignes dans la structure actuelle
  // Elles sont généralement dans les établissements

  return {
    denomination,
    sigle,
    nomCommercial,
    enseignes,
  }
}

/**
 * Extrait tous les noms uniques depuis les données INPI
 */
export function extractAllINPINames(data: INPICompanyInfo): string[] {
  const names = new Set<string>()

  const { denomination, sigle, nomCommercial, enseignes } = extractINPIDenominations(data)

  if (denomination) names.add(denomination)
  if (sigle) names.add(sigle)
  if (nomCommercial) names.add(nomCommercial)
  enseignes.forEach((e) => names.add(e))

  // Filtrer les noms trop courts
  return Array.from(names).filter((n) => n && n.length >= 2)
}

// ============================================================================
// SERVICE UNIFIÉ
// ============================================================================

/**
 * Récupère toutes les dénominations depuis toutes les sources disponibles
 * Priorité : INPI > Annuaire Entreprises
 */
export async function fetchAllCompanyNames(siren: string): Promise<CompanyNames | null> {
  if (!siren || siren.length !== 9) {
    console.error('[CompanyNames] SIREN invalide:', siren)
    return null
  }

  const allNames = new Set<string>()
  const sources: CompanyNames['sources'] = []

  let raisonSociale = ''
  let sigle: string | null = null
  let nomCommercial: string | null = null
  const enseignes: string[] = []

  // 1. Essayer INPI (source la plus officielle)
  if (isINPIConfigured()) {
    try {
      const inpiData = await getCompanyInfo(siren)
      if (inpiData) {
        sources.push('INPI')
        console.log(`[CompanyNames] INPI data loaded for ${siren}`)

        const inpiDenoms = extractINPIDenominations(inpiData)

        if (inpiDenoms.denomination) {
          raisonSociale = inpiDenoms.denomination
          allNames.add(inpiDenoms.denomination)
        }
        if (inpiDenoms.sigle) {
          sigle = inpiDenoms.sigle
          allNames.add(inpiDenoms.sigle)
        }
        if (inpiDenoms.nomCommercial) {
          nomCommercial = inpiDenoms.nomCommercial
          allNames.add(inpiDenoms.nomCommercial)
        }
        inpiDenoms.enseignes.forEach((e) => {
          enseignes.push(e)
          allNames.add(e)
        })
      }
    } catch (error) {
      console.error('[CompanyNames] Erreur INPI:', error)
    }
  } else {
    console.log('[CompanyNames] INPI non configuré, skip')
  }

  // 2. Compléter avec Annuaire Entreprises (toujours disponible)
  try {
    const annuaireData = await fetchEntrepriseBySiren(siren)
    if (annuaireData) {
      sources.push('ANNUAIRE')
      console.log(`[CompanyNames] Annuaire data loaded for ${siren}`)

      // Compléter les champs manquants
      if (!raisonSociale && annuaireData.nom_complet) {
        raisonSociale = annuaireData.nom_complet
      }
      if (!sigle && annuaireData.sigle) {
        sigle = annuaireData.sigle
      }
      if (!nomCommercial && annuaireData.siege?.nom_commercial) {
        nomCommercial = annuaireData.siege.nom_commercial
      }

      // Enseignes depuis Annuaire
      if (annuaireData.siege?.liste_enseignes?.length) {
        annuaireData.siege.liste_enseignes.forEach((e) => {
          if (e && !enseignes.includes(e)) {
            enseignes.push(e)
          }
        })
      }

      // Ajouter tous les noms depuis Annuaire
      const annuaireNames = extractAnnuaireNames(annuaireData)
      annuaireNames.forEach((n) => allNames.add(n))
    }
  } catch (error) {
    console.error('[CompanyNames] Erreur Annuaire:', error)
  }

  // Si aucune source n'a fonctionné
  if (sources.length === 0) {
    console.error('[CompanyNames] Aucune source disponible pour:', siren)
    return null
  }

  // Dédupliquer et filtrer
  const filteredNames = Array.from(allNames).filter((n) => {
    if (!n || n.length < 2) return false
    // Exclure les formes juridiques seules
    const formsToExclude = ['SAS', 'SARL', 'SA', 'EURL', 'SCI', 'SASU', 'SNC', 'SELARL', 'EI']
    if (formsToExclude.includes(n.toUpperCase())) return false
    return true
  })

  console.log(
    `[CompanyNames] ${siren}: ${filteredNames.length} noms trouvés (sources: ${sources.join(', ')})`
  )

  return {
    raisonSociale,
    sigle,
    nomCommercial,
    enseignes,
    allNames: filteredNames,
    sources,
    lastUpdate: new Date().toISOString(),
  }
}

/**
 * Version légère qui utilise uniquement les données déjà chargées
 * (Annuaire depuis le cache de la page)
 */
export function extractCompanyNamesFromAnnuaire(
  annuaireData: AnnuaireEntreprise | null
): CompanyNames | null {
  if (!annuaireData) return null

  const allNames = new Set<string>()

  // Raison sociale
  const raisonSociale = annuaireData.nom_complet || annuaireData.nom_raison_sociale || ''
  if (raisonSociale) allNames.add(raisonSociale)

  // Sigle
  const sigle = annuaireData.sigle || null
  if (sigle) allNames.add(sigle)

  // Nom commercial
  const nomCommercial = annuaireData.siege?.nom_commercial || null
  if (nomCommercial) allNames.add(nomCommercial)

  // Enseignes
  const enseignes = annuaireData.siege?.liste_enseignes || []
  enseignes.forEach((e) => {
    if (e) allNames.add(e)
  })

  // Ajouter tous les noms extraits
  const annuaireNames = extractAnnuaireNames(annuaireData)
  annuaireNames.forEach((n) => allNames.add(n))

  return {
    raisonSociale,
    sigle,
    nomCommercial,
    enseignes: enseignes.filter(Boolean) as string[],
    allNames: Array.from(allNames).filter((n) => n && n.length >= 2),
    sources: ['ANNUAIRE'],
    lastUpdate: new Date().toISOString(),
  }
}
