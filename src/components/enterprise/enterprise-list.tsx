'use client'

import { Archive } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreatorFilter, EnterpriseWithScore } from '@/repositories/enterprise.repository'
import { EnterpriseCard } from './enterprise-card'

interface EnterpriseListProps {
  enterprises: EnterpriseWithScore[]
  currentUserEmail: string
  creatorEmails: string[]
  currentFilter: CreatorFilter
  archivedCount?: number
}

export function EnterpriseList({
  enterprises,
  currentUserEmail,
  creatorEmails,
  currentFilter,
  archivedCount = 0,
}: EnterpriseListProps) {
  const router = useRouter()

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams()
    if (value !== 'all') {
      params.set('filter', value)
    }
    const queryString = params.toString()
    router.push(`/enterprise${queryString ? `?${queryString}` : ''}`)
  }

  // Build filter options
  const otherCreators = creatorEmails.filter((email) => email !== currentUserEmail)

  return (
    <div className="space-y-4">
      {/* Filter dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Filtrer par :</span>
        <Select value={currentFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-55">
            <SelectValue placeholder="Tous les dossiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les dossiers</SelectItem>
            <SelectItem value="mine">Mes dossiers</SelectItem>
            {otherCreators.length > 0 && (
              <>
                <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  Autres créateurs
                </div>
                {otherCreators.map((email) => (
                  <SelectItem key={email} value={email}>
                    {email}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Enterprise list */}
      {enterprises.length === 0 ? (
        <div className="rounded-lg border bg-muted/50 py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            {currentFilter === 'all'
              ? 'Aucun dossier pour le moment.'
              : currentFilter === 'mine'
                ? "Vous n'avez créé aucun dossier."
                : 'Aucun dossier créé par cet utilisateur.'}
          </p>
          <Button asChild>
            <Link href="/enterprise/new">Créer votre premier dossier</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {enterprises.map((enterprise) => (
            <li key={enterprise.id}>
              <EnterpriseCard enterprise={enterprise} currentUserEmail={currentUserEmail} />
            </li>
          ))}
        </ul>
      )}

      {/* Link to archives */}
      {archivedCount > 0 && (
        <div className="border-t pt-4">
          <Link
            href="/enterprise/archives"
            className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <Archive className="h-4 w-4" />
            <span>Dossiers archivés</span>
            <Badge variant="secondary" className="ml-1">
              {archivedCount}
            </Badge>
          </Link>
        </div>
      )}
    </div>
  )
}
