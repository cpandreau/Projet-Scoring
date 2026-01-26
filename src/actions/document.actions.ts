'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  DEFAULT_DOCUMENT_TYPE,
  DOCUMENT_TYPE_FOLDERS,
  type DocumentType,
  type TypeLiasse,
} from '@/types/document'

// Helper pour sanitizer un nom de fichier pour Supabase Storage
// Remplace les caractères spéciaux, accents, espaces par des équivalents valides
function sanitizeFilename(filename: string): string {
  // Séparer le nom et l'extension
  const lastDot = filename.lastIndexOf('.')
  const name = lastDot > 0 ? filename.slice(0, lastDot) : filename
  const ext = lastDot > 0 ? filename.slice(lastDot) : ''

  // Normaliser les accents (NFD décompose, puis on retire les diacritiques)
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Remplacer les caractères non valides
  const sanitized = normalized
    .replace(/\s+/g, '_') // espaces -> underscores
    .replace(/[()[\]{}]/g, '') // supprimer parenthèses et crochets
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // tout autre caractère -> underscore
    .replace(/_+/g, '_') // multiples underscores -> un seul
    .replace(/^_|_$/g, '') // supprimer underscores en début/fin

  return sanitized + ext.toLowerCase()
}

// Helper pour construire le chemin de stockage
function buildStoragePath(
  userId: string,
  enterpriseId: string,
  type: DocumentType,
  filename: string
): string {
  const folder = DOCUMENT_TYPE_FOLDERS[type]
  const sanitizedFilename = sanitizeFilename(filename)
  return `${userId}/${enterpriseId}/${folder}/${sanitizedFilename}`
}

// Helper pour extraire le nom de fichier d'un chemin de stockage
function extractFilename(storagePath: string): string {
  const parts = storagePath.split('/')
  return parts[parts.length - 1]
}

export interface FileUploadData {
  file: File
  annee?: number | null
  type?: DocumentType | null
}

export async function uploadDocuments(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const enterpriseId = formData.get('enterpriseId') as string
  const filesCount = parseInt(formData.get('filesCount') as string, 10)

  if (!enterpriseId || Number.isNaN(filesCount) || filesCount === 0) {
    return { error: 'Données manquantes' }
  }

  // Reconstruire les fichiers avec leurs métadonnées
  const filesData: FileUploadData[] = []
  for (let i = 0; i < filesCount; i++) {
    const file = formData.get(`file_${i}`) as File
    const anneeStr = formData.get(`annee_${i}`) as string
    const typeStr = formData.get(`type_${i}`) as string

    if (file) {
      filesData.push({
        file,
        annee: anneeStr ? parseInt(anneeStr, 10) : null,
        type: typeStr ? (typeStr as DocumentType) : null,
      })
    }
  }

  if (filesData.length === 0) {
    return { error: 'Aucun fichier à uploader' }
  }

  // Vérifier que le dossier appartient à l'utilisateur
  const { data: enterprise, error: enterpriseError } = await supabase
    .from('dossiers')
    .select('id, user_id')
    .eq('id', enterpriseId)
    .single()

  if (enterpriseError || !enterprise) {
    console.error('Error fetching enterprise:', enterpriseError)
    return { error: 'Dossier non trouvé' }
  }

  if (enterprise.user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  const errors: string[] = []
  const uploadedPaths: string[] = []

  for (const { file, annee, type } of filesData) {
    if (file.type !== 'application/pdf') {
      errors.push(`${file.name}: format non PDF`)
      continue
    }

    // Déterminer le type à utiliser (fourni ou par défaut)
    const documentType = type || DEFAULT_DOCUMENT_TYPE

    // Upload vers Supabase Storage avec la nouvelle structure
    // {userId}/{enterpriseId}/{type}/{timestamp}_{filename}
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const storagePath = buildStoragePath(user.id, enterpriseId, documentType, filename)

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      errors.push(`${file.name}: erreur d'upload`)
      continue
    }

    uploadedPaths.push(storagePath)

    // Insérer dans la table documents avec les métadonnées fournies
    const { error: insertError } = await supabase.from('documents').insert({
      dossier_id: enterpriseId,
      annee_exercice: annee || null,
      nom_fichier: file.name,
      storage_path: storagePath,
      type: documentType,
    })

    if (insertError) {
      console.error('Error inserting document:', insertError)
      // Supprimer le fichier uploadé en cas d'erreur
      await supabase.storage.from('documents').remove([storagePath])
      errors.push(`${file.name}: erreur d'enregistrement`)
    }
  }

  // Mettre à jour le statut du dossier si au moins un document a été uploadé
  if (uploadedPaths.length > 0) {
    const { error: updateError } = await supabase
      .from('dossiers')
      .update({ statut: 'documents_uploades' })
      .eq('id', enterpriseId)

    if (updateError) {
      console.error('Error updating enterprise status:', updateError)
    }
  }

  revalidatePath(`/enterprise/${enterpriseId}`)

  if (errors.length > 0) {
    return { error: `Erreurs: ${errors.join(', ')}` }
  }

  return { success: true }
}

export async function updateDocument(
  documentId: string,
  enterpriseId: string,
  data: { annee_exercice?: number | null; type?: DocumentType }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier l'accès au document
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*, dossiers!inner(user_id)')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    console.error('Error fetching document:', docError)
    return { error: 'Document non trouvé' }
  }

  if ((document.dossiers as { user_id: string }).user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  // Si on change le type, déplacer le fichier dans le bon dossier
  let newStoragePath = document.storage_path

  if (data.type && data.type !== document.type) {
    const filename = extractFilename(document.storage_path)
    newStoragePath = buildStoragePath(user.id, enterpriseId, data.type, filename)

    // Déplacer le fichier (copier puis supprimer)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path)

    if (downloadError) {
      console.error('Error downloading file for move:', downloadError)
      return { error: 'Erreur lors du déplacement du fichier' }
    }

    // Upload vers le nouveau chemin
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(newStoragePath, fileData, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file to new location:', uploadError)
      return { error: 'Erreur lors du déplacement du fichier' }
    }

    // Supprimer l'ancien fichier
    const { error: removeError } = await supabase.storage
      .from('documents')
      .remove([document.storage_path])

    if (removeError) {
      console.error('Error removing old file:', removeError)
      // On continue quand même, le nouveau fichier est en place
    }
  }

  // Mettre à jour le document dans la base
  const updateData: Record<string, unknown> = { ...data }
  if (newStoragePath !== document.storage_path) {
    updateData.storage_path = newStoragePath
  }

  const { error: updateError } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId)

  if (updateError) {
    console.error('Error updating document:', updateError)
    return { error: 'Erreur lors de la mise à jour' }
  }

  revalidatePath(`/enterprise/${enterpriseId}`)

  return { success: true }
}

export async function deleteDocument(documentId: string, enterpriseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer le document
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*, dossiers!inner(user_id)')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    console.error('Error fetching document:', docError)
    return { error: 'Document non trouvé' }
  }

  // Vérifier l'accès
  if ((document.dossiers as { user_id: string }).user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  // Supprimer du storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([document.storage_path])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
  }

  // Supprimer de la table
  const { error: deleteError } = await supabase.from('documents').delete().eq('id', documentId)

  if (deleteError) {
    console.error('Error deleting document:', deleteError)
    return { error: 'Erreur lors de la suppression du document' }
  }

  // Vérifier s'il reste des documents
  const { data: remainingDocs } = await supabase
    .from('documents')
    .select('id')
    .eq('dossier_id', enterpriseId)

  // Si plus de documents, remettre le statut à brouillon
  if (!remainingDocs || remainingDocs.length === 0) {
    await supabase.from('dossiers').update({ statut: 'brouillon' }).eq('id', enterpriseId)
  }

  revalidatePath(`/enterprise/${enterpriseId}`)

  return { success: true }
}

export async function getDocumentUrl(documentId: string): Promise<{
  url?: string
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer le document avec vérification d'accès
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('storage_path, dossiers!inner(user_id)')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    console.error('Error fetching document:', docError)
    return { error: 'Document non trouvé' }
  }

  const dossier = document.dossiers as unknown as { user_id: string }
  if (dossier.user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  // Générer une URL signée (valable 1 heure)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.storage_path, 3600)

  if (signedUrlError || !signedUrlData) {
    console.error('Error creating signed URL:', signedUrlError)
    return { error: "Erreur lors de la génération de l'URL" }
  }

  return { url: signedUrlData.signedUrl }
}

export async function updateDocumentTypeLiasse(
  documentId: string,
  typeLiasse: TypeLiasse
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier l'accès au document et qu'il n'a pas déjà été extrait
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*, dossiers!inner(user_id)')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    console.error('Error fetching document:', docError)
    return { error: 'Document non trouvé' }
  }

  if ((document.dossiers as { user_id: string }).user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  // Vérifier que le document est une liasse fiscale
  if (document.type !== 'liasse_fiscale') {
    return { error: "Ce document n'est pas une liasse fiscale" }
  }

  // Mettre à jour le type de liasse
  const { error: updateError } = await supabase
    .from('documents')
    .update({ type_liasse: typeLiasse })
    .eq('id', documentId)

  if (updateError) {
    console.error('Error updating document type_liasse:', updateError)
    return { error: 'Erreur lors de la mise à jour' }
  }

  revalidatePath(`/enterprise/${document.dossier_id}`)
  revalidatePath('/enterprise')

  return { success: true }
}
