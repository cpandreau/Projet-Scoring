'use client'

import { Archive, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import {
  bulkPermanentDeleteEnterprises,
  bulkRestoreEnterprises,
  permanentDeleteEnterprise,
  restoreEnterprise,
} from '@/actions/enterprise.actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import type { ArchivedEnterprise } from '@/repositories/enterprise.repository'
import { ArchiveCard } from './archive-card'

interface ArchivesListProps {
  archives: ArchivedEnterprise[]
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

export function ArchivesList({ archives }: ArchivesListProps) {
  const [viewMode, setViewMode] = useViewMode('archives-list-view', 'table')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'single' | 'bulk'
    id?: string
  } | null>(null)

  const allIds = archives.map((a) => a.id)
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

  const handleRestore = (id: string) => {
    startTransition(async () => {
      await restoreEnterprise(id)
    })
  }

  const handleBulkRestore = () => {
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      await bulkRestoreEnterprises(ids)
      setSelectedIds(new Set())
    })
  }

  const confirmDelete = (type: 'single' | 'bulk', id?: string) => {
    setPendingDelete({ type, id })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!pendingDelete) return

    startTransition(async () => {
      if (pendingDelete.type === 'single' && pendingDelete.id) {
        await permanentDeleteEnterprise(pendingDelete.id)
      } else if (pendingDelete.type === 'bulk') {
        const ids = Array.from(selectedIds)
        await bulkPermanentDeleteEnterprises(ids)
        setSelectedIds(new Set())
      }
      setDeleteDialogOpen(false)
      setPendingDelete(null)
    })
  }

  if (archives.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 py-12 text-center">
        <Archive className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Aucun dossier archivé</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Header with bulk actions and view toggle */}
        <div className="flex items-center justify-between">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
              <span className="font-medium text-sm">
                {selectedIds.size} dossier{selectedIds.size > 1 ? 's' : ''} sélectionné
                {selectedIds.size > 1 ? 's' : ''}
              </span>
              <Button variant="outline" size="sm" onClick={handleBulkRestore} disabled={isPending}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restaurer
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => confirmDelete('bulk')}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer définitivement
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
                  <TableHead className="text-right">
                    <SortableHeader label="Archivé le" sortKey="deleted" className="justify-end" />
                  </TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archives.map((archive) => {
                  const isSelected = selectedIds.has(archive.id)

                  return (
                    <TableRow
                      key={archive.id}
                      className="group"
                      data-state={isSelected ? 'selected' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(archive.id)}
                          aria-label={`Sélectionner ${archive.raison_sociale || 'Sans nom'}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {archive.raison_sociale || 'Sans nom'}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {archive.siren || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(archive.deleted_at)}
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
                            <DropdownMenuItem
                              onClick={() => handleRestore(archive.id)}
                              disabled={isPending}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restaurer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmDelete('single', archive.id)}
                              disabled={isPending}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer définitivement
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
            {archives.map((archive) => (
              <ArchiveCard
                key={archive.id}
                archive={archive}
                isSelected={selectedIds.has(archive.id)}
                onSelect={toggleOne}
                onRestore={handleRestore}
                onDelete={(id) => confirmDelete('single', id)}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation dialog for permanent delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suppression définitive</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.{' '}
              {pendingDelete?.type === 'bulk'
                ? `${selectedIds.size} dossier${selectedIds.size > 1 ? 's' : ''} seront définitivement supprimés.`
                : 'Ce dossier sera définitivement supprimé.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
