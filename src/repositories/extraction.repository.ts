import { createClient } from '@/lib/supabase/server'
import type { ExtractionData } from '@/schemas/extraction.schema'

export interface ExtractedDocument {
  id: string
  created_at: string
  document_id: string
  donnees: ExtractionData
  is_validated: boolean
}

export async function getExtractionByDocument(
  documentId: string
): Promise<ExtractedDocument | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('donnees_extraites')
    .select('*')
    .eq('document_id', documentId)
    .single()

  if (error || !data) {
    return null
  }

  return data as ExtractedDocument
}

export async function getExtractionsByEnterprise(
  enterpriseId: string
): Promise<Map<string, ExtractedDocument>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('donnees_extraites')
    .select('*, documents!inner(dossier_id)')
    .eq('documents.dossier_id', enterpriseId)

  if (error || !data) {
    return new Map()
  }

  const extractionsMap = new Map<string, ExtractedDocument>()
  for (const extraction of data) {
    extractionsMap.set(extraction.document_id, extraction as ExtractedDocument)
  }

  return extractionsMap
}
