'use client'

import { ChevronRight, Home, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Fragment } from 'react'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { cn } from '@/lib/utils'

export function AppBreadcrumb() {
  const { items, loading } = useBreadcrumb()

  // Ne pas afficher si aucun breadcrumb ou un seul élément (page d'accueil)
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Fil d'Ariane" className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm">
        {/* Icône Home */}
        <li>
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-brand hover:bg-brand/5 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Accueil</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <Fragment key={item.href}>
              <li className="text-muted-foreground/40">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li>
                {item.isCurrentPage || isLast ? (
                  <span
                    className={cn(
                      'px-2 py-1 rounded-md font-medium text-foreground',
                      loading && index > 0 && 'text-muted-foreground'
                    )}
                    aria-current="page"
                  >
                    {loading && index > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Chargement...
                      </span>
                    ) : (
                      item.label
                    )}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="px-2 py-1 rounded-md text-muted-foreground hover:text-brand hover:bg-brand/5 transition-colors"
                  >
                    {loading && index > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
