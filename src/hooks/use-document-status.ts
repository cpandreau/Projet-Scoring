import type { ExtractionData } from '@/schemas/extraction.schema'
import type { Document } from '@/types'

// Statuts possibles d'un document
export type DocumentStatus = 'non_applicable' | 'en_attente' | 'extrait' | 'valide'

export interface DocumentStatusInfo {
  status: DocumentStatus
  label: string
  color: 'gray' | 'orange' | 'green'
  canExtract: boolean
  canView: boolean
  canReextract: boolean
}

interface ExtractedData {
  id: string
  donnees: ExtractionData
  is_validated: boolean
}

/**
 * Détermine le statut d'un document en fonction de son type et de son extraction
 */
export function getDocumentStatus(
  document: Document,
  extraction: ExtractedData | undefined,
  hasLocalExtraction: boolean = false
): DocumentStatusInfo {
  const isLiasseFiscale = document.type === 'liasse_fiscale'
  const hasExtraction = !!extraction || hasLocalExtraction
  const isValidated = extraction?.is_validated ?? false

  // Document non liasse fiscale : pas d'extraction possible
  if (!isLiasseFiscale) {
    return {
      status: 'non_applicable',
      label: 'Non extractible',
      color: 'gray',
      canExtract: false,
      canView: false,
      canReextract: false,
    }
  }

  // Liasse fiscale validée
  if (isValidated) {
    return {
      status: 'valide',
      label: 'Validé',
      color: 'green',
      canExtract: false,
      canView: true,
      canReextract: true,
    }
  }

  // Liasse fiscale extraite mais non validée
  if (hasExtraction) {
    return {
      status: 'extrait',
      label: 'Extrait',
      color: 'orange',
      canExtract: false,
      canView: true,
      canReextract: true,
    }
  }

  // Liasse fiscale en attente d'extraction
  return {
    status: 'en_attente',
    label: 'À extraire',
    color: 'gray',
    canExtract: true,
    canView: false,
    canReextract: false,
  }
}

/**
 * Calcule le résumé des statuts pour une liste de documents
 */
export function getDocumentsSummary(
  documents: Document[],
  extractions: Map<string, ExtractedData>
): {
  total: number
  liassesFiscales: number
  valides: number
  extraits: number
  enAttente: number
  autres: number
} {
  let liassesFiscales = 0
  let valides = 0
  let extraits = 0
  let enAttente = 0
  let autres = 0

  for (const doc of documents) {
    const extraction = extractions.get(doc.id)
    const statusInfo = getDocumentStatus(doc, extraction)

    switch (statusInfo.status) {
      case 'valide':
        liassesFiscales++
        valides++
        break
      case 'extrait':
        liassesFiscales++
        extraits++
        break
      case 'en_attente':
        liassesFiscales++
        enAttente++
        break
      case 'non_applicable':
        autres++
        break
    }
  }

  return {
    total: documents.length,
    liassesFiscales,
    valides,
    extraits,
    enAttente,
    autres,
  }
}
