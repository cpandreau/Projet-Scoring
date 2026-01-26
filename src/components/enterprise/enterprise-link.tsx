'use client'

import Link from 'next/link'
import { type ReactNode, useCallback } from 'react'
import { usePendingEnterprise } from '@/hooks'

interface EnterprisePreview {
  id: string
  raison_sociale: string | null
  siren: string | null
}

interface EnterpriseLinkProps {
  enterprise: EnterprisePreview
  /** Sous-route optionnelle (informations, score, documents, etc.) */
  section?: string
  className?: string
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  title?: string
}

/**
 * Lien vers une entreprise avec breadcrumb optimiste.
 * Définit l'entreprise en attente avant la navigation pour afficher
 * immédiatement le nom dans le breadcrumb.
 */
export function EnterpriseLink({
  enterprise,
  section = 'informations',
  className,
  children,
  onClick,
  title,
}: EnterpriseLinkProps) {
  const { setNavigatingTo } = usePendingEnterprise()

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Définir l'entreprise pour le breadcrumb optimiste
      setNavigatingTo({
        id: enterprise.id,
        raison_sociale: enterprise.raison_sociale || 'Sans nom',
        siren: enterprise.siren || '',
      })
      // Appeler le onClick parent si fourni
      onClick?.(e)
    },
    [enterprise.id, enterprise.raison_sociale, enterprise.siren, setNavigatingTo, onClick]
  )

  return (
    <Link
      href={`/enterprise/${enterprise.id}/${section}`}
      className={className}
      onClick={handleClick}
      title={title}
    >
      {children}
    </Link>
  )
}
