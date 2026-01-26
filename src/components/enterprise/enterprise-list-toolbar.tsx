'use client'

import { Activity, User } from 'lucide-react'
import { DataTableFilter } from '@/components/ui/data-table-filter'
import { DataTableSearch } from '@/components/ui/data-table-search'

const STATUS_OPTIONS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'documents_uploades', label: 'Documents uploadés' },
  { value: 'extrait', label: 'Extrait' },
  { value: 'valide', label: 'Validé' },
  { value: 'analyse', label: 'Analysé' },
]

const SCORE_OPTIONS = [
  { value: 'danger', label: 'Risque (< 4)' },
  { value: 'warning', label: 'Moyen (4-6)' },
  { value: 'caution', label: 'Correct (6-8)' },
  { value: 'success', label: 'Excellent (≥ 8)' },
  { value: 'none', label: 'Non calculé' },
]

interface EnterpriseListToolbarProps {
  creatorEmails: string[]
  currentUserEmail: string
}

export function EnterpriseListToolbar({
  creatorEmails,
  currentUserEmail,
}: EnterpriseListToolbarProps) {
  // Build creator options, filtering out current user (they can use "mine")
  const otherCreators = creatorEmails.filter((email) => email !== currentUserEmail)
  const creatorOptions = [
    { value: 'mine', label: 'Mes dossiers' },
    ...otherCreators.map((email) => ({ value: email, label: email })),
  ]

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <DataTableSearch
        placeholder="Rechercher par nom ou SIREN..."
        className="w-full sm:max-w-sm"
      />

      <div className="flex flex-wrap gap-2">
        <DataTableFilter
          options={STATUS_OPTIONS}
          placeholder="Statut"
          paramName="status"
          allLabel="Tous les statuts"
          icon={<Activity className="mr-2 h-4 w-4" />}
        />

        <DataTableFilter
          options={SCORE_OPTIONS}
          placeholder="Score"
          paramName="score"
          allLabel="Tous les scores"
        />

        {creatorOptions.length > 1 && (
          <DataTableFilter
            options={creatorOptions}
            placeholder="Créateur"
            paramName="creator"
            allLabel="Tous les créateurs"
            icon={<User className="mr-2 h-4 w-4" />}
          />
        )}
      </div>
    </div>
  )
}
