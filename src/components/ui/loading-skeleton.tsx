import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Skeleton pour une ligne de texte
interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 1, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

// Skeleton pour une carte entreprise
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 rounded-lg border p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

// Skeleton pour la liste des entreprises
interface SkeletonCardListProps {
  count?: number
  className?: string
}

export function SkeletonCardList({ count = 3, className }: SkeletonCardListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// Skeleton pour un tableau de données
interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      {/* Header */}
      <div className="flex gap-4 bg-muted/50 p-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn('h-4 flex-1', colIndex === 0 ? 'w-1/3' : '')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton pour un document
export function SkeletonDocument({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 rounded-lg border p-3 sm:p-4', className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

// Skeleton pour la liste des documents
interface SkeletonDocumentListProps {
  count?: number
  className?: string
}

export function SkeletonDocumentList({ count = 3, className }: SkeletonDocumentListProps) {
  return (
    <div className={cn('space-y-2 sm:space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDocument key={i} />
      ))}
    </div>
  )
}

// Skeleton pour le score global (cercle)
export function SkeletonScoreCircle({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Skeleton className="h-40 w-40 rounded-full" />
      <Skeleton className="h-5 w-24" />
    </div>
  )
}

// Skeleton pour le radar
export function SkeletonRadar({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Skeleton className="h-48 w-48 rounded-full" />
    </div>
  )
}

// Skeleton pour une carte de famille de score
export function SkeletonScoreFamily({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 rounded-lg border p-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton pour le dashboard de score complet
export function SkeletonScoreDashboard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {/* Header avec score et radar */}
      <div className="grid grid-cols-1 items-center gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex justify-center">
          <SkeletonScoreCircle />
        </div>
        <SkeletonRadar />
        <div className="md:col-span-2 lg:col-span-1">
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Familles */}
      <div>
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonScoreFamily key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton pour les informations entreprise
export function SkeletonEnterpriseDetail({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Card principale */}
      <div className="space-y-4 rounded-lg border p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton pour la page entreprise complète
export function SkeletonEnterprisePage({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-full" />

      {/* Content */}
      <SkeletonEnterpriseDetail />
    </div>
  )
}
