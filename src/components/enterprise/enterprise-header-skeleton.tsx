import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton pour le header entreprise.
 * Affiche les éléments statiques et skeleton uniquement pour les données.
 */
export function EnterpriseHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div>
            {/* Nom de l'entreprise - skeleton */}
            <Skeleton className="h-7 w-48 sm:h-8" />
            {/* SIREN - skeleton */}
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Indicateurs - skeleton */}
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  )
}
