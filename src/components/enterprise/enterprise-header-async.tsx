import { getDataFreshness, shouldRefreshDossier } from '@/lib/services/entreprise-sync-service'
import { createClient } from '@/lib/supabase/server'
import { getEnterpriseById } from '@/repositories/enterprise.repository'
import { EnterpriseHeader } from './enterprise-header'

interface EnterpriseHeaderAsyncProps {
  id: string
}

/**
 * Composant async qui fetch les données de l'entreprise pour le header.
 * Doit être wrappé dans un Suspense.
 */
export async function EnterpriseHeaderAsync({ id }: EnterpriseHeaderAsyncProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const enterprise = await getEnterpriseById(id)

  if (!enterprise) return null

  const freshness = getDataFreshness(enterprise)
  const refreshCheck = shouldRefreshDossier(enterprise)

  return (
    <EnterpriseHeader enterprise={enterprise} freshness={freshness} refreshCheck={refreshCheck} />
  )
}
