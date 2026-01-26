'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { syncEntreprise } from '@/lib/services/entreprise-sync-service'
import { createClient } from '@/lib/supabase/server'
import type {
  CreateEnterpriseData,
  EnrichmentStatus,
  EnterpriseStatus,
  UpdateEnterpriseData,
} from '@/types'

// ============================================================================
// Types pour useActionState (React 19)
// ============================================================================

/**
 * Type de retour standardisé pour les Server Actions compatibles useActionState
 */
export type ActionState<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
} | null

export async function createEnterprise(data: CreateEnterpriseData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { data: enterprise, error } = await supabase
    .from('dossiers')
    .insert({
      user_id: user.id,
      siren: data.siren,
      siret: data.siret || null,
      raison_sociale: data.raison_sociale,
      forme_juridique: data.forme_juridique || null,
      code_naf: data.code_naf || null,
      adresse: data.adresse || null,
      statut: 'brouillon',
      created_by_email: user.email,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating enterprise:', error)
    return { error: 'Erreur lors de la création du dossier' }
  }

  // Launch INPI enrichment in background (fire-and-forget)
  // Don't await - return immediately to not block the user
  if (data.siren) {
    // Mark as in_progress
    updateDossierEnrichmentStatus(enterprise.id, 'in_progress').catch(() => {
      // Ignore status update errors
    })

    syncEntreprise(data.siren, enterprise.id)
      .then((result) => {
        // Update status based on result
        const status: EnrichmentStatus = result.success
          ? 'completed'
          : result.sources.insee || result.sources.inpi
            ? 'partial'
            : 'failed'
        return updateDossierEnrichmentStatus(enterprise.id, status)
      })
      .catch(() => {
        return updateDossierEnrichmentStatus(enterprise.id, 'failed')
      })
  }

  revalidatePath('/enterprise')
  redirect(`/enterprise/${enterprise.id}`)
}

export async function updateEnterpriseStatus(id: string, statut: EnterpriseStatus) {
  const supabase = await createClient()

  const { error } = await supabase.from('dossiers').update({ statut }).eq('id', id)

  if (error) {
    console.error('Error updating enterprise status:', error)
    return { error: 'Erreur lors de la mise à jour du statut' }
  }

  revalidatePath(`/enterprise/${id}`)
  revalidatePath('/enterprise')

  return { success: true }
}

/**
 * Updates an enterprise's editable fields
 */
export async function updateEnterprise(
  dossierId: string,
  data: UpdateEnterpriseData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Validate SIRET if provided (14 digits)
  if (data.siret && !/^\d{14}$/.test(data.siret.replace(/\s/g, ''))) {
    return { success: false, error: 'Le SIRET doit contenir exactement 14 chiffres' }
  }

  // Build update object with only defined fields
  const updateData: Record<string, unknown> = {}
  if (data.raison_sociale !== undefined) updateData.raison_sociale = data.raison_sociale
  if (data.siret !== undefined) updateData.siret = data.siret?.replace(/\s/g, '') || null
  if (data.code_naf !== undefined) updateData.code_naf = data.code_naf || null
  if (data.adresse !== undefined) updateData.adresse = data.adresse || null
  if (data.ville !== undefined) updateData.ville = data.ville || null
  if (data.code_postal !== undefined) updateData.code_postal = data.code_postal || null

  const { error } = await supabase
    .from('dossiers')
    .update(updateData)
    .eq('id', dossierId)
    .is('deleted_at', null)

  if (error) {
    console.error('Error updating enterprise:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du dossier' }
  }

  revalidatePath(`/enterprise/${dossierId}`)
  revalidatePath('/enterprise')

  return { success: true }
}

/**
 * Soft deletes (archives) an enterprise
 */
export async function deleteEnterprise(
  dossierId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Soft delete: set deleted_at and deleted_by
  const { error } = await supabase
    .from('dossiers')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq('id', dossierId)
    .is('deleted_at', null)

  if (error) {
    console.error('Error archiving enterprise:', error)
    return { success: false, error: "Erreur lors de l'archivage du dossier" }
  }

  revalidatePath('/enterprise')

  return { success: true }
}

/**
 * Restores a soft-deleted (archived) enterprise
 */
export async function restoreEnterprise(
  dossierId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const { error } = await supabase
    .from('dossiers')
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq('id', dossierId)
    .not('deleted_at', 'is', null)

  if (error) {
    console.error('Error restoring enterprise:', error)
    return { success: false, error: 'Erreur lors de la restauration du dossier' }
  }

  revalidatePath('/enterprise')
  revalidatePath(`/enterprise/${dossierId}`)

  return { success: true }
}

/**
 * Updates the enrichment status of a dossier
 * Used internally after INPI sync operations
 */
export async function updateDossierEnrichmentStatus(
  dossierId: string,
  status: EnrichmentStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('dossiers')
    .update({ enrichissement_status: status })
    .eq('id', dossierId)

  if (error) {
    console.error('[updateDossierEnrichmentStatus] Error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Checks the enrichment status of a dossier (for polling)
 * Includes fallback logic: if status is pending/in_progress but inpi_sync_at exists,
 * the data is actually synced - we fix the status and return 'completed'
 */
export async function checkEnrichmentStatus(
  dossierId: string
): Promise<{ status: EnrichmentStatus | null; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dossiers')
    .select('enrichissement_status, inpi_sync_at, insee_sync_at')
    .eq('id', dossierId)
    .single()

  if (error) {
    console.error('[checkEnrichmentStatus] Error:', error)
    return { status: null, error: error.message }
  }

  const status = data?.enrichissement_status as EnrichmentStatus | null
  const inpiSyncAt = data?.inpi_sync_at
  const inseeSyncAt = data?.insee_sync_at

  // Fallback: if status is pending/in_progress but data is already synced
  if ((status === 'pending' || status === 'in_progress') && (inpiSyncAt || inseeSyncAt)) {
    // Determine the correct status based on what was synced
    const correctedStatus: EnrichmentStatus = inpiSyncAt ? 'completed' : 'partial'

    // Fix the status in DB for future calls (fire-and-forget)
    updateDossierEnrichmentStatus(dossierId, correctedStatus).catch(() => {
      // Ignore errors during status correction
    })

    return { status: correctedStatus }
  }

  return { status }
}

/**
 * Retries the INPI enrichment for a dossier
 */
export async function retryEnrichment(
  dossierId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get the SIREN from the dossier
  const { data: dossier, error: fetchError } = await supabase
    .from('dossiers')
    .select('siren')
    .eq('id', dossierId)
    .single()

  if (fetchError || !dossier?.siren) {
    return { success: false, error: 'Impossible de récupérer le SIREN du dossier' }
  }

  // Mark as in_progress
  await updateDossierEnrichmentStatus(dossierId, 'in_progress')

  // Launch sync in background
  syncEntreprise(dossier.siren, dossierId)
    .then((result) => {
      const status: EnrichmentStatus = result.success
        ? 'completed'
        : result.sources.insee || result.sources.inpi
          ? 'partial'
          : 'failed'
      return updateDossierEnrichmentStatus(dossierId, status)
    })
    .catch(() => {
      return updateDossierEnrichmentStatus(dossierId, 'failed')
    })

  return { success: true }
}

/**
 * Refreshes enterprise data from INPI/INSEE sources
 * This is a server action that can be called from client components
 */
export async function refreshEnterprise(
  siren: string,
  dossierId: string
): Promise<{
  success: boolean
  sources: { insee: boolean; inpi: boolean }
  error?: string
}> {
  const result = await syncEntreprise(siren, dossierId)
  return result
}

/**
 * Gets all archived (soft-deleted) enterprises
 */
export async function getArchivedEnterprises(): Promise<{
  success: boolean
  data: Array<{
    id: string
    raison_sociale: string | null
    siren: string | null
    deleted_at: string
    deleted_by: string | null
    created_by_email: string | null
  }>
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dossiers')
    .select('id, raison_sociale, siren, deleted_at, deleted_by, created_by_email')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  if (error) {
    console.error('Error fetching archived enterprises:', error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

/**
 * Gets the count of archived enterprises (for badge display)
 */
export async function getArchivedCount(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('dossiers')
    .select('*', { count: 'exact', head: true })
    .not('deleted_at', 'is', null)

  if (error) {
    console.error('Error counting archived enterprises:', error)
    return 0
  }

  return count || 0
}

/**
 * Bulk archive (soft delete) multiple enterprises
 */
export async function bulkArchiveEnterprises(
  dossierIds: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, count: 0, error: 'Non authentifié' }
  }

  if (dossierIds.length === 0) {
    return { success: false, count: 0, error: 'Aucun dossier sélectionné' }
  }

  const { error, count } = await supabase
    .from('dossiers')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .in('id', dossierIds)
    .is('deleted_at', null)

  if (error) {
    console.error('Error bulk archiving enterprises:', error)
    return { success: false, count: 0, error: "Erreur lors de l'archivage des dossiers" }
  }

  revalidatePath('/enterprise')

  return { success: true, count: count || dossierIds.length }
}

/**
 * Permanently deletes an enterprise (irreversible)
 */
export async function permanentDeleteEnterprise(
  dossierId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Only allow permanent delete of already archived enterprises
  const { error } = await supabase
    .from('dossiers')
    .delete()
    .eq('id', dossierId)
    .not('deleted_at', 'is', null)

  if (error) {
    console.error('Error permanently deleting enterprise:', error)
    return { success: false, error: 'Erreur lors de la suppression définitive du dossier' }
  }

  revalidatePath('/enterprise/archives')

  return { success: true }
}

/**
 * Bulk restore multiple archived enterprises
 */
export async function bulkRestoreEnterprises(
  dossierIds: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, count: 0, error: 'Non authentifié' }
  }

  if (dossierIds.length === 0) {
    return { success: false, count: 0, error: 'Aucun dossier sélectionné' }
  }

  const { error, count } = await supabase
    .from('dossiers')
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .in('id', dossierIds)
    .not('deleted_at', 'is', null)

  if (error) {
    console.error('Error bulk restoring enterprises:', error)
    return { success: false, count: 0, error: 'Erreur lors de la restauration des dossiers' }
  }

  revalidatePath('/enterprise')
  revalidatePath('/enterprise/archives')

  return { success: true, count: count || dossierIds.length }
}

/**
 * Bulk permanently delete multiple archived enterprises (irreversible)
 */
export async function bulkPermanentDeleteEnterprises(
  dossierIds: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, count: 0, error: 'Non authentifié' }
  }

  if (dossierIds.length === 0) {
    return { success: false, count: 0, error: 'Aucun dossier sélectionné' }
  }

  // Only allow permanent delete of already archived enterprises
  const { error, count } = await supabase
    .from('dossiers')
    .delete()
    .in('id', dossierIds)
    .not('deleted_at', 'is', null)

  if (error) {
    console.error('Error bulk permanently deleting enterprises:', error)
    return {
      success: false,
      count: 0,
      error: 'Erreur lors de la suppression définitive des dossiers',
    }
  }

  revalidatePath('/enterprise/archives')

  return { success: true, count: count || dossierIds.length }
}

// ============================================================================
// Actions pour useActionState (React 19)
// ============================================================================

/**
 * Server Action pour créer une entreprise - Compatible useActionState
 * @param previousState - État précédent (ignoré, requis par useActionState)
 * @param formData - Données du formulaire
 */
export async function createEnterpriseAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState<{ id: string }>> {
  const siren = formData.get('siren') as string
  const siret = formData.get('siret') as string
  const raisonSociale = formData.get('raison_sociale') as string
  const formeJuridique = formData.get('forme_juridique') as string
  const codeNaf = formData.get('code_naf') as string
  const adresse = formData.get('adresse') as string

  // Validation
  const fieldErrors: Record<string, string[]> = {}

  if (!siren || !/^\d{9}$/.test(siren)) {
    fieldErrors.siren = ['Le SIREN doit contenir exactement 9 chiffres']
  }

  if (!raisonSociale || raisonSociale.trim().length === 0) {
    fieldErrors.raison_sociale = ['La raison sociale est requise']
  }

  if (siret && !/^\d{14}$/.test(siret)) {
    fieldErrors.siret = ['Le SIRET doit contenir exactement 14 chiffres']
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: 'Veuillez corriger les erreurs du formulaire',
      fieldErrors,
    }
  }

  // Appel de la fonction existante
  const result = await createEnterprise({
    siren,
    siret: siret || undefined,
    raison_sociale: raisonSociale,
    forme_juridique: formeJuridique || undefined,
    code_naf: codeNaf || undefined,
    adresse: adresse || undefined,
  })

  // createEnterprise fait un redirect en cas de succès, on n'arrive ici qu'en cas d'erreur
  if ('error' in result && result.error) {
    return {
      success: false,
      error: result.error,
    }
  }

  // Ne devrait pas arriver car redirect() est appelé en cas de succès
  return { success: true }
}

/**
 * Server Action pour archiver une entreprise - Compatible useActionState
 * @param previousState - État précédent (ignoré, requis par useActionState)
 * @param formData - Données du formulaire (contient enterpriseId)
 */
export async function deleteEnterpriseAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const enterpriseId = formData.get('enterpriseId') as string

  if (!enterpriseId) {
    return {
      success: false,
      error: 'ID entreprise manquant',
    }
  }

  const result = await deleteEnterprise(enterpriseId)

  if (!result.success) {
    return {
      success: false,
      error: result.error || "Erreur lors de l'archivage",
    }
  }

  return { success: true }
}

/**
 * Server Action pour restaurer une entreprise - Compatible useActionState
 * @param previousState - État précédent (ignoré, requis par useActionState)
 * @param formData - Données du formulaire (contient enterpriseId)
 */
export async function restoreEnterpriseAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const enterpriseId = formData.get('enterpriseId') as string

  if (!enterpriseId) {
    return {
      success: false,
      error: 'ID entreprise manquant',
    }
  }

  const result = await restoreEnterprise(enterpriseId)

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Erreur lors de la restauration',
    }
  }

  return { success: true }
}
