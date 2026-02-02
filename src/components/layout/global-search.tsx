'use client'

import {
  Archive,
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
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm',
          'text-muted-foreground bg-muted/50 rounded-lg',
          'border border-border hover:border-brand/30 hover:bg-muted',
          'transition-colors'
        )}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Rechercher...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
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
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
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
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-1.5 rounded-lg bg-muted">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {enterprise.raison_sociale || 'Sans nom'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          SIREN: {enterprise.siren} · {STATUT_LABELS[enterprise.statut]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {enterprise.score !== null && enterprise.score !== undefined && zone && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full font-bold text-xs font-mono',
                            getZoneTextClasses(zone),
                            'bg-current/10'
                          )}
                          style={{
                            backgroundColor: `color-mix(in srgb, currentColor 10%, transparent)`,
                          }}
                        >
                          {enterprise.score.toFixed(1)}
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
                          className="p-1.5 rounded-md hover:bg-brand/10 hover:text-brand transition-colors"
                          title="Voir le score"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(enterprise, 'documents')
                          }}
                          className="p-1.5 rounded-md hover:bg-brand/10 hover:text-brand transition-colors"
                          title="Voir les documents"
                        >
                          <FileText className="h-3.5 w-3.5" />
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
              <CommandItem
                onSelect={() => handleNavigate('/enterprise/new')}
                className="gap-3 py-2.5"
              >
                <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Nouveau dossier</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleNavigate('/dashboard')}
                className="gap-3 py-2.5"
              >
                <div className="p-1.5 rounded-lg bg-muted">
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                </div>
                <span>Tableau de bord</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleNavigate('/enterprise')}
                className="gap-3 py-2.5"
              >
                <div className="p-1.5 rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <span>Liste des entreprises</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleNavigate('/enterprise/archives')}
                className="gap-3 py-2.5"
              >
                <div className="p-1.5 rounded-lg bg-muted">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </div>
                <span>Archives</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
