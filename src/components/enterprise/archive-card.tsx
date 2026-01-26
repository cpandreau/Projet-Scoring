'use client'

import { MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ArchivedEnterprise } from '@/repositories/enterprise.repository'

interface ArchiveCardProps {
  archive: ArchivedEnterprise
  isSelected?: boolean
  onSelect?: (id: string) => void
  onRestore?: (id: string) => void
  onDelete?: (id: string) => void
  isPending?: boolean
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export const ArchiveCard = memo(function ArchiveCard({
  archive,
  isSelected = false,
  onSelect,
  onRestore,
  onDelete,
  isPending = false,
}: ArchiveCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      {/* Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(archive.id)}
            aria-label={`Sélectionner ${archive.raison_sociale || 'Sans nom'}`}
          />
        </div>
      )}

      {/* Actions dropdown */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRestore && (
              <DropdownMenuItem onClick={() => onRestore(archive.id)} disabled={isPending}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restaurer
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(archive.id)}
                disabled={isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer définitivement
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="pl-6">
        <p className="font-medium">{archive.raison_sociale || 'Sans nom'}</p>
        <p className="text-muted-foreground text-sm">SIREN: {archive.siren || 'N/A'}</p>
        <p className="mt-2 text-muted-foreground text-xs">
          Archivé le {formatDate(archive.deleted_at)}
        </p>
      </div>
    </div>
  )
})

ArchiveCard.displayName = 'ArchiveCard'
