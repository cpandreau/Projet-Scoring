'use client'

import { Archive, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { bulkArchiveEnterprises, deleteEnterprise } from '@/actions/enterprise.actions'
import { EnterpriseCard } from '@/components/enterprise/enterprise-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SortableHeader } from '@/components/ui/sortable-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useViewMode, ViewToggle } from '@/components/ui/view-toggle'
import { getScoreZone, getZoneTextClasses } from '@/config/colors.config'
import { cn } from '@/lib/utils'
import type { EnterpriseWithScore } from '@/repositories/enterprise.repository'
import { type EnterpriseStatus, STATUT_COLORS, STATUT_LABELS } from '@/types'

interface EnterpriseListContentProps {
  enterprises: EnterpriseWithScore[]
  currentUserEmail: string
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground text-sm">-</span>
  }

  const zone = getScoreZone(score)
  return (
    <span className={cn('font-bold tabular-nums', getZoneTextClasses(zone))}>
      {score.toFixed(1)}
    </span>
  )
}

export function EnterpriseListContent({
  enterprises,
  currentUserEmail,
}: EnterpriseListContentProps) {
  const [viewMode, setViewMode] = useViewMode('enterprise-list-view', 'table')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const allIds = enterprises.map((e) => e.id)
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id))
  const someSelected = selectedIds.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleArchive = (id: string) => {
    startTransition(async () => {
      await deleteEnterprise(id)
    })
  }

  const handleBulkArchive = () => {
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      await bulkArchiveEnterprises(ids)
      setSelectedIds(new Set())
    })
  }

  if (enterprises.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 py-12 text-center">
        <p className="mb-4 text-muted-foreground">Aucune entreprise trouvée avec ces critères.</p>
        <Button asChild>
          <Link href="/enterprise/new">Créer un nouveau dossier</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with bulk actions and view toggle */}
      <div className="flex items-center justify-between">
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
            <span className="font-medium text-sm">
              {selectedIds.size} dossier{selectedIds.size > 1 ? 's' : ''} sélectionné
              {selectedIds.size > 1 ? 's' : ''}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkArchive}
              disabled={isPending}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archiver la sélection
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              disabled={isPending}
            >
              Annuler
            </Button>
          </div>
        ) : (
          <div />
        )}
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={someSelected ? 'indeterminate' : allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Tout sélectionner"
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Nom" sortKey="name" />
                </TableHead>
                <TableHead className="hidden sm:table-cell">SIREN</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">
                  <SortableHeader label="Score" sortKey="score" className="justify-end" />
                </TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  <SortableHeader label="Créé le" sortKey="created" className="justify-end" />
                </TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enterprises.map((enterprise) => {
                const isOwner = enterprise.created_by_email === currentUserEmail
                const isSelected = selectedIds.has(enterprise.id)

                return (
                  <TableRow
                    key={enterprise.id}
                    className="group"
                    data-state={isSelected ? 'selected' : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(enterprise.id)}
                        aria-label={`Sélectionner ${enterprise.raison_sociale || 'Sans nom'}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/enterprise/${enterprise.id}/informations`}
                        className="font-medium hover:underline"
                      >
                        {enterprise.raison_sociale || 'Sans nom'}
                      </Link>
                      {isOwner && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Moi
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {enterprise.siren || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          STATUT_COLORS[enterprise.statut as EnterpriseStatus]
                        )}
                      >
                        {STATUT_LABELS[enterprise.statut as EnterpriseStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ScoreBadge score={enterprise.score} />
                    </TableCell>
                    <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                      {formatDate(enterprise.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/enterprise/${enterprise.id}/informations`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir les détails
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleArchive(enterprise.id)}
                            disabled={isPending}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Archiver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cards view */}
      {viewMode === 'cards' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enterprises.map((enterprise) => (
            <EnterpriseCard
              key={enterprise.id}
              enterprise={enterprise}
              currentUserEmail={currentUserEmail}
              isSelected={selectedIds.has(enterprise.id)}
              onSelect={toggleOne}
              onArchive={handleArchive}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
