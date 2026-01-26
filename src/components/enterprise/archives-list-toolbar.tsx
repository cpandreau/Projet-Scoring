'use client'

import { DataTableSearch } from '@/components/ui/data-table-search'

export function ArchivesListToolbar() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <DataTableSearch
        placeholder="Rechercher par nom ou SIREN..."
        className="w-full sm:max-w-sm"
      />
    </div>
  )
}
