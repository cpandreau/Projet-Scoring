'use client'

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DeleteEnterpriseDialog, EditEnterpriseDialog } from '@/components/dossier'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type {
  DataFreshnessResult,
  RefreshCheckResult,
} from '@/lib/services/entreprise-sync-service'
import type { Enterprise } from '@/types'
import { AutoRefreshHandler } from './auto-refresh-handler'
import { EnrichmentStatusBanner } from './enrichment-status-banner'
import { FreshnessIndicator } from './freshness-indicator'
import { StatusIndicator } from './status-indicator'

interface EnterpriseHeaderProps {
  enterprise: Enterprise
  freshness: DataFreshnessResult
  refreshCheck: RefreshCheckResult
}

export function EnterpriseHeader({ enterprise, freshness, refreshCheck }: EnterpriseHeaderProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Header avec nom de l'entreprise et statut */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div>
            <h1 className="truncate font-bold text-xl sm:text-2xl">
              {enterprise.raison_sociale || 'Sans nom'}
            </h1>
            <p className="text-muted-foreground text-sm">SIREN: {enterprise.siren}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Archiver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3">
          <FreshnessIndicator
            status={freshness.status}
            inpiSyncAt={freshness.inpiSyncAt}
            inseeSyncAt={freshness.inseeSyncAt}
            message={freshness.message}
            dossierId={enterprise.id}
            siren={enterprise.siren}
          />
          <StatusIndicator status={enterprise.statut} />
        </div>
      </div>

      {/* Dialogs */}
      <EditEnterpriseDialog enterprise={enterprise} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteEnterpriseDialog
        enterprise={enterprise}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      {/* Auto-refresh handler for expired cache */}
      {enterprise.siren && (
        <AutoRefreshHandler
          dossierId={enterprise.id}
          siren={enterprise.siren}
          needsRefresh={refreshCheck.needsRefresh}
          reason={refreshCheck.reason}
        />
      )}

      {/* Enrichment status banner */}
      <EnrichmentStatusBanner
        status={enterprise.enrichissement_status ?? null}
        dossierId={enterprise.id}
      />
    </div>
  )
}
