'use client'

import { useCallback, useState } from 'react'
import { extractDocument, updateExtraction, validateExtraction } from '@/actions/extraction.actions'
import { showError, showSuccess } from '@/lib/toast'
import type { ExtractionData } from '@/schemas/extraction.schema'

export function useExtraction() {
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ExtractionData | null>(null)

  const extract = useCallback(async (documentId: string) => {
    setExtracting(true)
    setError(null)
    setData(null)

    const result = await extractDocument(documentId)

    if (result.error) {
      console.error('Erreur extraction:', result.error)
      setError(result.error)
      showError("Erreur lors de l'extraction", result.error)
      setExtracting(false)
      return { success: false, error: result.error }
    }

    if (result.data) {
      setData(result.data)
    }

    showSuccess('Extraction terminée')
    setExtracting(false)
    return { success: true, data: result.data }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearData = useCallback(() => {
    setData(null)
  }, [])

  return {
    extracting,
    error,
    data,
    extract,
    clearError,
    clearData,
  }
}

export function useUpdateExtraction(enterpriseId: string) {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(
    async (extractionId: string, donnees: ExtractionData) => {
      setUpdating(true)
      setError(null)

      const result = await updateExtraction(extractionId, enterpriseId, donnees)

      if (result.error) {
        console.error('Erreur mise à jour extraction:', result.error)
        setError(result.error)
        showError('Erreur lors de la sauvegarde', result.error)
        setUpdating(false)
        return { success: false, error: result.error }
      }

      showSuccess('Données sauvegardées')
      setUpdating(false)
      return { success: true }
    },
    [enterpriseId]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    updating,
    error,
    update,
    clearError,
  }
}

export function useValidateExtraction(enterpriseId: string) {
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback(
    async (extractionId: string) => {
      setValidating(true)
      setError(null)

      const result = await validateExtraction(extractionId, enterpriseId)

      if (result.error) {
        console.error('Erreur validation extraction:', result.error)
        setError(result.error)
        showError('Erreur lors de la validation', result.error)
        setValidating(false)
        return { success: false, error: result.error }
      }

      showSuccess('Données validées')
      setValidating(false)
      return { success: true }
    },
    [enterpriseId]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    validating,
    error,
    validate,
    clearError,
  }
}
