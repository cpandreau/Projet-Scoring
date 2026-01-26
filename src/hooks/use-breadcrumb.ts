'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useCurrentEnterprise } from './use-current-enterprise'
import { usePendingEnterpriseName } from './use-pending-enterprise'

export interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage: boolean
}

export function useBreadcrumb(): {
  items: BreadcrumbItem[]
  loading: boolean
} {
  const pathname = usePathname()
  const { enterprise, enterpriseId, loading } = useCurrentEnterprise()
  // Nom optimiste : affiché immédiatement quand on clique sur une card
  const pendingName = usePendingEnterpriseName(enterpriseId)

  const items = useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = []

    // /dashboard
    if (pathname === '/dashboard') {
      breadcrumbs.push({
        label: 'Tableau de bord',
        href: '/dashboard',
        isCurrentPage: true,
      })
      return breadcrumbs
    }

    // Pages /enterprise/*
    if (pathname.startsWith('/enterprise')) {
      // Toujours ajouter "Tableau de bord" en premier pour les pages enterprise
      breadcrumbs.push({
        label: 'Tableau de bord',
        href: '/dashboard',
        isCurrentPage: false,
      })

      breadcrumbs.push({
        label: 'Entreprises',
        href: '/enterprise',
        isCurrentPage: pathname === '/enterprise',
      })

      // /enterprise/new
      if (pathname === '/enterprise/new') {
        breadcrumbs.push({
          label: 'Nouvelle entreprise',
          href: '/enterprise/new',
          isCurrentPage: true,
        })
      }

      // /enterprise/archives
      if (pathname === '/enterprise/archives') {
        breadcrumbs.push({
          label: 'Archives',
          href: '/enterprise/archives',
          isCurrentPage: true,
        })
      }

      // /enterprise/[id] - utiliser le nom optimiste en priorité
      if (enterpriseId) {
        // Priorité : nom optimiste > nom réel > fallback
        const enterpriseName = pendingName || enterprise?.raison_sociale || 'Entreprise'

        breadcrumbs.push({
          label: enterpriseName,
          href: `/enterprise/${enterpriseId}`,
          isCurrentPage: true,
        })
      }
    }

    return breadcrumbs
  }, [pathname, enterpriseId, enterprise?.raison_sociale, pendingName])

  // Pas de loading si on a un nom optimiste
  return {
    items,
    loading: loading && !!enterpriseId && !pendingName,
  }
}
