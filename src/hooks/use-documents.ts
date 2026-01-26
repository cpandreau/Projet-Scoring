'use client'

import { useCallback, useState } from 'react'
import {
  deleteDocument,
  getDocumentUrl,
  updateDocument,
  updateDocumentTypeLiasse,
  uploadDocuments,
} from '@/actions/document.actions'
import { showError, showSuccess } from '@/lib/toast'
import type { DocumentType, TypeLiasse } from '@/types'

// Type pour les fichiers avec métadonnées
export interface FileWithMetadata {
  file: File
  annee?: number | null
  type?: DocumentType | null
}

// Hook pour gérer l'upload de documents
export function useUploadDocuments(enterpriseId: string) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const upload = useCallback(
    async (filesWithMetadata: FileWithMetadata[]) => {
      if (filesWithMetadata.length === 0) {
        setError('Veuillez sélectionner au moins un fichier')
        return { success: false }
      }

      setUploading(true)
      setError(null)
      setSuccess(null)

      const formData = new FormData()
      formData.append('enterpriseId', enterpriseId)
      formData.append('filesCount', filesWithMetadata.length.toString())

      filesWithMetadata.forEach((item, index) => {
        formData.append(`file_${index}`, item.file)
        if (item.annee !== null && item.annee !== undefined) {
          formData.append(`annee_${index}`, item.annee.toString())
        }
        if (item.type) {
          formData.append(`type_${index}`, item.type)
        }
      })

      const result = await uploadDocuments(formData)

      if (result.error) {
        console.error('Erreur upload documents:', result.error)
        setError(result.error)
        showError("Erreur lors de l'upload", result.error)
        setUploading(false)
        return { success: false, error: result.error }
      }

      const message = `${filesWithMetadata.length} document${filesWithMetadata.length > 1 ? 's' : ''} uploadé${filesWithMetadata.length > 1 ? 's' : ''}`
      setSuccess(message)
      showSuccess(message)
      setUploading(false)
      return { success: true }
    },
    [enterpriseId]
  )

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  return {
    uploading,
    error,
    success,
    upload,
    clearMessages,
  }
}

// Hook pour gérer la mise à jour d'un document
export function useUpdateDocument(enterpriseId: string) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateYear = useCallback(
    async (documentId: string, year: string) => {
      setUpdating(documentId)
      setError(null)

      const annee = year === 'none' ? null : parseInt(year, 10)
      const result = await updateDocument(documentId, enterpriseId, {
        annee_exercice: annee,
      })

      if (result.error) {
        console.error('Erreur mise à jour année:', result.error)
        setError(result.error)
      }

      setUpdating(null)
      return result
    },
    [enterpriseId]
  )

  const updateType = useCallback(
    async (documentId: string, type: DocumentType) => {
      setUpdating(documentId)
      setError(null)

      const result = await updateDocument(documentId, enterpriseId, { type })

      if (result.error) {
        console.error('Erreur mise à jour type:', result.error)
        setError(result.error)
      }

      setUpdating(null)
      return result
    },
    [enterpriseId]
  )

  const updateTypeLiasse = useCallback(async (documentId: string, typeLiasse: TypeLiasse) => {
    setUpdating(documentId)
    setError(null)

    const result = await updateDocumentTypeLiasse(documentId, typeLiasse)

    if (result.error) {
      console.error('Erreur mise à jour type liasse:', result.error)
      setError(result.error)
    }

    setUpdating(null)
    return result
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    updating,
    error,
    updateYear,
    updateType,
    updateTypeLiasse,
    clearError,
  }
}

// Hook pour gérer la suppression d'un document
export function useDeleteDocument(enterpriseId: string) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const remove = useCallback(
    async (documentId: string, fileName: string, skipConfirm = false) => {
      if (!skipConfirm && !confirm(`Êtes-vous sûr de vouloir supprimer "${fileName}" ?`)) {
        return { cancelled: true }
      }

      setDeleting(documentId)
      setError(null)

      const result = await deleteDocument(documentId, enterpriseId)

      if (result.error) {
        console.error('Erreur suppression document:', result.error)
        setError(result.error)
        showError('Erreur lors de la suppression', result.error)
      } else {
        showSuccess('Document supprimé')
      }

      setDeleting(null)
      return result
    },
    [enterpriseId]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    deleting,
    error,
    remove,
    clearError,
  }
}

// Hook pour récupérer l'URL signée d'un document
export function useDocumentUrl() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)

  const fetchUrl = useCallback(async (documentId: string) => {
    setLoading(true)
    setError(null)
    setUrl(null)

    const result = await getDocumentUrl(documentId)

    if (result.error) {
      console.error('Erreur récupération URL:', result.error)
      setError(result.error)
      setLoading(false)
      return { success: false, error: result.error }
    }

    setUrl(result.url || null)
    setLoading(false)
    return { success: true, url: result.url }
  }, [])

  const clearUrl = useCallback(() => {
    setUrl(null)
    setError(null)
  }, [])

  return {
    loading,
    error,
    url,
    fetchUrl,
    clearUrl,
  }
}

// Hook combiné pour gérer tous les documents d'une entreprise
export function useDocuments(enterpriseId: string) {
  const uploadHook = useUploadDocuments(enterpriseId)
  const updateHook = useUpdateDocument(enterpriseId)
  const deleteHook = useDeleteDocument(enterpriseId)

  // Combiner les erreurs pour affichage
  const error = uploadHook.error || updateHook.error || deleteHook.error

  const clearAllErrors = useCallback(() => {
    uploadHook.clearMessages()
    updateHook.clearError()
    deleteHook.clearError()
  }, [uploadHook, updateHook, deleteHook])

  return {
    // Upload
    uploading: uploadHook.uploading,
    uploadError: uploadHook.error,
    uploadSuccess: uploadHook.success,
    upload: uploadHook.upload,
    clearUploadMessages: uploadHook.clearMessages,

    // Update
    updating: updateHook.updating,
    updateError: updateHook.error,
    updateYear: updateHook.updateYear,
    updateType: updateHook.updateType,
    updateTypeLiasse: updateHook.updateTypeLiasse,

    // Delete
    deleting: deleteHook.deleting,
    deleteError: deleteHook.error,
    remove: deleteHook.remove,

    // Combined
    error,
    clearAllErrors,
  }
}
