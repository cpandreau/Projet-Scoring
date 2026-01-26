'use client'

import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Enterprise } from '@/types'

interface UseCurrentEnterpriseReturn {
  enterprise: Enterprise | null
  enterpriseId: string | null
  loading: boolean
  error: string | null
}

export function useCurrentEnterprise(): UseCurrentEnterpriseReturn {
  const params = useParams()
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchedIdRef = useRef<string | null>(null)

  // Extraire l'ID de l'entreprise depuis les params
  const enterpriseId = (params?.id as string | undefined) || null

  useEffect(() => {
    // Si pas d'ID, on ne fait rien (les valeurs dérivées gèrent le null)
    if (!enterpriseId) {
      fetchedIdRef.current = null
      return
    }

    // Si on a déjà fetch cet ID, ne pas refaire
    if (fetchedIdRef.current === enterpriseId) {
      return
    }

    let cancelled = false
    fetchedIdRef.current = enterpriseId

    const doFetch = async () => {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('dossiers')
        .select('*')
        .eq('id', enterpriseId)
        .single()

      if (cancelled) return

      if (fetchError) {
        console.error('Error fetching enterprise:', fetchError)
        setError("Erreur lors de la récupération de l'entreprise")
        setEnterprise(null)
      } else {
        setEnterprise(data as Enterprise)
      }

      setLoading(false)
    }

    doFetch()

    return () => {
      cancelled = true
    }
  }, [enterpriseId])

  // Retourne null pour enterprise si pas d'ID (dérivé, pas de setState)
  return {
    enterprise: enterpriseId ? enterprise : null,
    enterpriseId,
    loading: enterpriseId ? loading : false,
    error: enterpriseId ? error : null,
  }
}
