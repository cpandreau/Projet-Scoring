'use client'

import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  Loader2,
  Plus,
  Search,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { searchEnterprises } from '@/actions/search.actions'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getScoreZone, getZoneTextClasses } from '@/config/colors.config'
import { usePendingEnterprise } from '@/hooks'
import { cn } from '@/lib/utils'
import type { EnterpriseWithScore } from '@/repositories/enterprise.repository'
import { STATUT_LABELS } from '@/types'

export function GlobalSearch() {
  const router = useRouter()
  const { setNavigatingTo } = usePendingEnterprise()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EnterpriseWithScore[]>([])
  const [isPending, startTransition] = useTransition()

  // Raccourci clavier Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Recherche avec debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        const searchResults = await searchEnterprises(query)
        setResults(searchResults)
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = useCallback(
    (enterprise: EnterpriseWithScore, section?: string) => {
      setOpen(false)
      setQuery('')
      setResults([])
      // Définir l'entreprise pour le breadcrumb optimiste
      setNavigatingTo({
        id: enterprise.id,
        raison_sociale: enterprise.raison_sociale || 'Sans nom',
        siren: enterprise.siren || '',
      })
      const url = section
        ? `/enterprise/${enterprise.id}/${section}`
        : `/enterprise/${enterprise.id}/informations`
      router.push(url)
    },
    [router, setNavigatingTo]
  )

  const handleNavigate = useCallback(
    (path: string) => {
      setOpen(false)
      setQuery('')
      setResults([])
      router.push(path)
    },
    [router]
  )

  return (
    <>
      {/* Bouton pour ouvrir */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="pointer-events-none ml-2 hidden select-none rounded border bg-background px-1.5 font-mono text-xs sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Dialog de recherche */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Rechercher par SIREN ou raison sociale..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isPending && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isPending && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>Aucun résultat pour &quot;{query}&quot;</CommandEmpty>
          )}

          {!isPending && results.length > 0 && (
            <CommandGroup heading="Entreprises">
              {results.map((enterprise) => {
                const zone =
                  enterprise.score !== null && enterprise.score !== undefined
                    ? getScoreZone(enterprise.score)
                    : null

                return (
                  <CommandItem
                    key={enterprise.id}
                    value={`${enterprise.raison_sociale} ${enterprise.siren}`}
                    onSelect={() => handleSelect(enterprise)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{enterprise.raison_sociale || 'Sans nom'}</p>
                        <p className="text-muted-foreground text-xs">
                          SIREN: {enterprise.siren} · {STATUT_LABELS[enterprise.statut]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {enterprise.score !== null && enterprise.score !== undefined && zone && (
                        <span className={cn('font-bold text-sm', getZoneTextClasses(zone))}>
                          {enterprise.score.toFixed(1)}/10
                        </span>
                      )}
                      {/* Actions rapides */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(enterprise, 'score')
                          }}
                          className="rounded p-1 hover:bg-muted"
                          title="Voir le score"
                        >
                          <BarChart3 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(enterprise, 'documents')
                          }}
                          className="rounded p-1 hover:bg-muted"
                          title="Voir les documents"
                        >
                          <FileText className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {!query && (
            <CommandGroup heading="Actions rapides">
              <CommandItem onSelect={() => handleNavigate('/enterprise/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau dossier
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate('/enterprise')}>
                <Building2 className="mr-2 h-4 w-4" />
                Liste des entreprises
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate('/enterprise/archives')}>
                <FileText className="mr-2 h-4 w-4" />
                Archives
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
