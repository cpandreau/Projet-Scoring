'use client'

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

interface EnterprisePreview {
  id: string
  raison_sociale: string
  siren: string
}

interface PendingEnterpriseContextValue {
  pendingEnterprise: EnterprisePreview | null
  setNavigatingTo: (enterprise: EnterprisePreview) => void
  clearPending: () => void
}

const PendingEnterpriseContext = createContext<PendingEnterpriseContextValue | null>(null)

export function PendingEnterpriseProvider({ children }: { children: ReactNode }) {
  const [pendingEnterprise, setPendingEnterprise] = useState<EnterprisePreview | null>(null)

  const setNavigatingTo = useCallback((enterprise: EnterprisePreview) => {
    setPendingEnterprise(enterprise)
  }, [])

  const clearPending = useCallback(() => {
    setPendingEnterprise(null)
  }, [])

  return (
    <PendingEnterpriseContext.Provider value={{ pendingEnterprise, setNavigatingTo, clearPending }}>
      {children}
    </PendingEnterpriseContext.Provider>
  )
}

export function usePendingEnterprise() {
  const context = useContext(PendingEnterpriseContext)
  if (!context) {
    throw new Error('usePendingEnterprise must be used within PendingEnterpriseProvider')
  }
  return context
}

/**
 * Hook simplifié pour récupérer le nom optimiste d'une entreprise
 * Retourne null si l'entreprise en attente ne correspond pas à l'ID donné
 */
export function usePendingEnterpriseName(enterpriseId: string | null): string | null {
  const context = useContext(PendingEnterpriseContext)
  if (!context || !enterpriseId) return null

  if (context.pendingEnterprise?.id === enterpriseId) {
    return context.pendingEnterprise.raison_sociale
  }
  return null
}
