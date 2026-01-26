'use server'

import type { SireneEtablissement, SireneResult, SireneSearchResponse } from '@/types/sirene'

const SIRENE_URL = process.env.SIRENE_URL
const SIRENE_API_KEY = process.env.SIRENE_API_KEY

function formatAdresse(adresse: SireneEtablissement['adresseEtablissement']): string {
  const parts = [
    adresse.numeroVoieEtablissement,
    adresse.typeVoieEtablissement,
    adresse.libelleVoieEtablissement,
  ]
    .filter(Boolean)
    .join(' ')

  const ville = [adresse.codePostalEtablissement, adresse.libelleCommuneEtablissement]
    .filter(Boolean)
    .join(' ')

  return [parts, ville].filter(Boolean).join(', ')
}

function formatRaisonSociale(uniteLegale: SireneEtablissement['uniteLegale']): string {
  if (uniteLegale.denominationUniteLegale) {
    return uniteLegale.denominationUniteLegale
  }
  return [uniteLegale.nomUniteLegale, uniteLegale.prenomUsuelUniteLegale].filter(Boolean).join(' ')
}

function transformEtablissement(etab: SireneEtablissement): SireneResult {
  return {
    siren: etab.siren,
    siret: etab.siret,
    raison_sociale: formatRaisonSociale(etab.uniteLegale),
    forme_juridique: etab.uniteLegale.categorieJuridiqueUniteLegale,
    code_naf: etab.uniteLegale.activitePrincipaleUniteLegale,
    adresse: formatAdresse(etab.adresseEtablissement),
  }
}

function isSiren(query: string): boolean {
  return /^\d{9}$/.test(query.replace(/\s/g, ''))
}

function isSiret(query: string): boolean {
  return /^\d{14}$/.test(query.replace(/\s/g, ''))
}

async function fetchSirene(endpoint: string): Promise<Response> {
  const response = await fetch(`${SIRENE_URL}${endpoint}`, {
    headers: {
      'X-INSEE-Api-Key-Integration': SIRENE_API_KEY!,
      Accept: 'application/json',
    },
  })
  return response
}

export async function searchSirene(query: string): Promise<SireneSearchResponse> {
  if (!query || query.trim().length < 3) {
    return { error: 'La recherche doit contenir au moins 3 caractères' }
  }

  if (!SIRENE_URL || !SIRENE_API_KEY) {
    return { error: 'Configuration API SIRENE manquante' }
  }

  const cleanQuery = query.trim().replace(/\s/g, '')

  try {
    let response: Response
    let data: { etablissements?: SireneEtablissement[]; etablissement?: SireneEtablissement }

    if (isSiret(cleanQuery)) {
      response = await fetchSirene(`/siret/${cleanQuery}`)
      if (!response.ok) {
        if (response.status === 404) {
          return { error: 'SIRET non trouvé' }
        }
        throw new Error(`Erreur API SIRENE: ${response.status}`)
      }
      data = await response.json()
      if (data.etablissement) {
        return { results: [transformEtablissement(data.etablissement)] }
      }
    } else if (isSiren(cleanQuery)) {
      response = await fetchSirene(`/siret?q=siren:${cleanQuery}&nombre=10`)
      if (!response.ok) {
        if (response.status === 404) {
          return { error: 'SIREN non trouvé' }
        }
        throw new Error(`Erreur API SIRENE: ${response.status}`)
      }
      data = await response.json()
      if (data.etablissements) {
        return { results: data.etablissements.map(transformEtablissement) }
      }
    } else {
      const encodedQuery = encodeURIComponent(
        `denominationUniteLegale:"*${query.trim()}*" OR nomUniteLegale:"*${query.trim()}*"`
      )
      response = await fetchSirene(`/siret?q=${encodedQuery}&nombre=10`)
      if (!response.ok) {
        if (response.status === 404) {
          return { results: [] }
        }
        throw new Error(`Erreur API SIRENE: ${response.status}`)
      }
      data = await response.json()
      if (data.etablissements) {
        return { results: data.etablissements.map(transformEtablissement) }
      }
    }

    return { results: [] }
  } catch (error) {
    console.error('Erreur lors de la recherche SIRENE:', error)
    return { error: "Erreur lors de la recherche dans l'API SIRENE" }
  }
}
