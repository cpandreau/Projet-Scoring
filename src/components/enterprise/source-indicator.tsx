'use client'

import { AlertTriangle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type DataSource = 'inpi' | 'insee' | 'manual'

interface SourceIndicatorProps {
  source: DataSource
  syncDate?: Date | string | null
  hasConflict?: boolean
  conflictSource?: DataSource
  className?: string
}

const sourceConfig: Record<DataSource, { label: string; color: string; shortLabel: string }> = {
  inpi: {
    label: 'INPI / RNE',
    color: 'text-blue-600 dark:text-blue-400',
    shortLabel: 'INPI',
  },
  insee: {
    label: 'INSEE / SIRENE',
    color: 'text-emerald-600 dark:text-emerald-400',
    shortLabel: 'INSEE',
  },
  manual: {
    label: 'Saisie manuelle',
    color: 'text-gray-500 dark:text-gray-400',
    shortLabel: 'Manuel',
  },
}

function formatSyncDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return ''
  }
}

export function SourceIndicator({
  source,
  syncDate,
  hasConflict,
  conflictSource,
  className = '',
}: SourceIndicatorProps) {
  const config = sourceConfig[source]
  const formattedDate = formatSyncDate(syncDate)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex cursor-help items-center gap-1 font-medium text-[10px] uppercase tracking-wide ${config.color} ${className}`}
          >
            {hasConflict && <AlertTriangle className="h-3 w-3 text-amber-500" />}
            {config.shortLabel}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p className="font-medium">Source : {config.label}</p>
            {formattedDate && <p className="text-muted-foreground">Sync : {formattedDate}</p>}
            {hasConflict && conflictSource && (
              <p className="text-amber-600 dark:text-amber-400">
                Divergence détectée avec {sourceConfig[conflictSource].label}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Composant pour afficher une ligne de données avec indicateur de source
interface DataRowWithSourceProps {
  label: string
  value: React.ReactNode
  source?: DataSource
  syncDate?: Date | string | null
  hasConflict?: boolean
  conflictSource?: DataSource
  className?: string
}

export function DataRowWithSource({
  label,
  value,
  source,
  syncDate,
  hasConflict,
  conflictSource,
  className = '',
}: DataRowWithSourceProps) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
        {label}
        {source && (
          <SourceIndicator
            source={source}
            syncDate={syncDate}
            hasConflict={hasConflict}
            conflictSource={conflictSource}
          />
        )}
      </dt>
      <dd className="mt-0.5 text-sm">{value || '—'}</dd>
    </div>
  )
}
