'use client'

import { BarChart3, Eye, FileText, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { memo, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getScoreZone, getZoneTextClasses } from '@/config/colors.config'
import { usePendingEnterprise } from '@/hooks'
import { cn } from '@/lib/utils'
import type { Enterprise } from '@/types'
import { StatusIndicator } from './status-indicator'

interface EnterpriseCardProps {
  enterprise: Enterprise & { score?: number | null }
  currentUserEmail: string
  isSelected?: boolean
  onSelect?: (id: string) => void
  onArchive?: (id: string) => void
  isPending?: boolean
}

/**
 * Retourne les classes de bordure gauche selon le score
 */
function getScoreBorderClass(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'border-l-4 border-l-muted'
  }
  if (score < 4) return 'border-l-4 border-l-red-500'
  if (score < 6) return 'border-l-4 border-l-orange-500'
  if (score < 8) return 'border-l-4 border-l-yellow-500'
  return 'border-l-4 border-l-green-500'
}

export const EnterpriseCard = memo(function EnterpriseCard({
  enterprise,
  currentUserEmail,
  isSelected = false,
  onSelect,
  onArchive,
  isPending = false,
}: EnterpriseCardProps) {
  const { setNavigatingTo } = usePendingEnterprise()
  const isOwner = enterprise.created_by_email === currentUserEmail
  const creatorDisplay = isOwner ? 'Moi' : enterprise.created_by_email
  const score = enterprise.score
  const zone = score !== null && score !== undefined ? getScoreZone(score) : null

  // Définir l'entreprise en attente pour le breadcrumb optimiste
  const handleNavigate = useCallback(() => {
    setNavigatingTo({
      id: enterprise.id,
      raison_sociale: enterprise.raison_sociale || 'Sans nom',
      siren: enterprise.siren || '',
    })
  }, [enterprise.id, enterprise.raison_sociale, enterprise.siren, setNavigatingTo])

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card transition-all',
        getScoreBorderClass(score),
        isSelected && 'ring-2 ring-primary'
      )}
    >
      {/* Checkbox */}
      {onSelect && (
        <div className="absolute left-3 top-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(enterprise.id)}
            aria-label={`Sélectionner ${enterprise.raison_sociale || 'Sans nom'}`}
          />
        </div>
      )}

      {/* Actions dropdown */}
      <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-md bg-card/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link
            href={`/enterprise/${enterprise.id}/score`}
            onClick={(e) => e.stopPropagation()}
            title="Voir le score"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="sr-only">Voir le score</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link
            href={`/enterprise/${enterprise.id}/documents`}
            onClick={(e) => e.stopPropagation()}
            title="Voir les documents"
          >
            <FileText className="h-4 w-4" />
            <span className="sr-only">Voir les documents</span>
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plus d'actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/enterprise/${enterprise.id}/informations`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/enterprise/${enterprise.id}/comparatif`}>Comparatif sectoriel</Link>
            </DropdownMenuItem>
            {onArchive && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(enterprise.id)
                  }}
                  disabled={isPending}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Archiver
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link
        href={`/enterprise/${enterprise.id}/informations`}
        onClick={handleNavigate}
        className="block p-4 pl-10"
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-24">
            <p className="font-medium">{enterprise.raison_sociale || 'Sans nom'}</p>
            <p className="text-muted-foreground text-sm">SIREN: {enterprise.siren || 'N/A'}</p>
            {creatorDisplay && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Créé par :</span>
                {isOwner ? (
                  <Badge variant="secondary" className="text-xs">
                    Moi
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">{creatorDisplay}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {score !== null && score !== undefined && zone && (
              <span className={cn('font-bold text-lg tabular-nums', getZoneTextClasses(zone))}>
                {score.toFixed(1)}
              </span>
            )}
            <StatusIndicator status={enterprise.statut} />
          </div>
        </div>
      </Link>
    </div>
  )
})

EnterpriseCard.displayName = 'EnterpriseCard'
