'use server'

import {
  type AnnuaireEntreprise,
  extractAllNames,
  extractMainDirectorName,
} from '@/lib/api/annuaire-entreprises'
import {
  type CompanyNewsResult,
  fetchCompanyNews,
  fetchSectorNews,
  fetchSectorNewsWithMethodology,
  type NewsArticle,
  type SectorNewsMethodology,
  type SectorNewsResult,
} from '@/lib/api/google-news'
import type { PlaceReputation } from '@/lib/api/google-places'
import { fetchSectorTrends, type SectorTrendsResult } from '@/lib/api/google-trends'
import { generateVeilleReport, type VeilleReportData } from '@/lib/pdf/generate-veille-report'

export interface NewsResult {
  companyNews: CompanyNewsResult
  sectorNews: SectorNewsResult
  companyName: string
  searchedNames: string[] // Tous les noms utilisés pour la recherche
}

export interface EnterpriseNewsOptions {
  companyName: string
  nafCode: string
  city?: string // Ville du siège pour améliorer la pertinence
  annuaireData?: AnnuaireEntreprise | null // Données Annuaire pour enrichir la recherche
}

/**
 * Récupère les actualités pour une entreprise et son secteur
 * Utilise l'API INSEE pour obtenir le libellé NAF officiel
 * Utilise les données Annuaire pour enrichir la recherche (enseigne, sigle, etc.)
 */
export async function getEnterpriseNews(options: EnterpriseNewsOptions): Promise<NewsResult> {
  const { companyName, nafCode, city, annuaireData } = options

  // Extraire tous les noms possibles depuis les données Annuaire
  let searchNames: string[] = [companyName]
  let directorName: string | null = null

  if (annuaireData) {
    const allNames = extractAllNames(annuaireData)
    if (allNames.length > 0) {
      searchNames = allNames
    }
    directorName = extractMainDirectorName(annuaireData)
  }

  // Le premier nom est le principal, les autres sont additionnels
  const primaryName = searchNames[0]
  const additionalTerms = [
    ...searchNames.slice(1),
    directorName, // Ajouter le dirigeant si disponible
  ].filter(Boolean) as string[]

  // Fetch en parallèle pour optimiser le temps de réponse
  // On récupère 15 articles pour permettre la pagination "Voir plus"
  const [companyNews, sectorNews] = await Promise.all([
    fetchCompanyNews({
      companyName: primaryName,
      city,
      additionalTerms: additionalTerms.length > 0 ? additionalTerms : undefined,
      maxResults: 15,
    }),
    fetchSectorNewsWithMethodology(nafCode, 15),
  ])

  return {
    companyNews,
    sectorNews,
    companyName,
    searchedNames: [primaryName, ...additionalTerms],
  }
}

/**
 * Récupère uniquement les actualités d'une entreprise
 */
export async function getCompanyNewsOnly(
  companyName: string,
  city?: string,
  maxResults = 5
): Promise<CompanyNewsResult> {
  return fetchCompanyNews({ companyName, city, maxResults })
}

/**
 * Récupère uniquement les actualités d'un secteur
 */
export async function getSectorNewsOnly(nafCode: string, maxResults = 5): Promise<NewsArticle[]> {
  return fetchSectorNews(nafCode, maxResults)
}

/**
 * Récupère les tendances Google Trends pour un secteur
 */
export async function getSectorTrends(nafCode: string): Promise<SectorTrendsResult> {
  return fetchSectorTrends(nafCode)
}

/**
 * Rafraîchit les actualités d'une entreprise (invalide le cache)
 */
export async function refreshNews(enterpriseId: string): Promise<void> {
  const { revalidatePath } = await import('next/cache')
  revalidatePath(`/enterprise/${enterpriseId}/veille`)
}

export interface ExportVeilleReportOptions {
  enterprise: {
    nom: string
    siren?: string | null
    nafCode?: string | null
  }
  companyName: string
  trends: SectorTrendsResult
  reputation: PlaceReputation
  annuaire: AnnuaireEntreprise | null
  companyNews: NewsArticle[]
  sectorNews: NewsArticle[]
  sectorMethodology: SectorNewsMethodology
  period: string
}

/**
 * Génère un rapport PDF de veille
 */
export async function exportVeilleReport(
  options: ExportVeilleReportOptions
): Promise<{ data: number[]; filename: string }> {
  const reportData: VeilleReportData = {
    ...options,
    generatedAt: new Date().toISOString(),
  }

  const pdfBytes = await generateVeilleReport(reportData)

  // Générer un nom de fichier sécurisé
  const safeName = options.enterprise.nom.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `veille_${safeName}_${dateStr}.pdf`

  return {
    data: Array.from(pdfBytes),
    filename,
  }
}
