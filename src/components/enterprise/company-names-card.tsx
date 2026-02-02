'use client'

import { Building2, CheckCircle2, Copy, Database, Loader2, RefreshCw, Tag } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getCompanyNames } from '@/actions/company-names.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { CompanyNames } from '@/lib/api/company-names'

interface CompanyNamesCardProps {
  siren: string
  initialNames?: CompanyNames | null
}

export function CompanyNamesCard({ siren, initialNames }: CompanyNamesCardProps) {
  const [names, setNames] = useState<CompanyNames | null>(initialNames || null)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(!initialNames && !!siren)

  // Charger les noms au montage si non fournis
  useEffect(() => {
    if (!initialNames && siren) {
      setIsLoading(true)
      startTransition(async () => {
        try {
          const result = await getCompanyNames(siren)
          setNames(result)
        } catch (error) {
          console.error('[CompanyNamesCard] Erreur:', error)
        } finally {
          setIsLoading(false)
        }
      })
    }
  }, [siren, initialNames])

  const handleRefresh = () => {
    if (!siren || isPending) return

    setIsLoading(true)
    toast.info('Chargement des dénominations...')

    startTransition(async () => {
      try {
        const result = await getCompanyNames(siren)
        setNames(result)
        if (result) {
          toast.success('Dénominations mises à jour', {
            description: `${result.allNames.length} nom(s) trouvé(s)`,
          })
        } else {
          toast.error('Impossible de récupérer les dénominations')
        }
      } catch (error) {
        console.error('[CompanyNamesCard] Erreur refresh:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    })
  }

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name)
    toast.success('Copié dans le presse-papier')
  }

  if (!siren) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Dénominations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">SIREN requis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Dénominations
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isLoading || isPending}
          >
            {isLoading || isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>Tous les noms officiels de l'entreprise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && !names ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : names ? (
          <>
            {/* Raison Sociale */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Raison Sociale
                </span>
              </div>
              <NameItem name={names.raisonSociale} onCopy={handleCopyName} isPrimary />
            </div>

            {/* Sigle */}
            {names.sigle && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Sigle</span>
                </div>
                <NameItem name={names.sigle} onCopy={handleCopyName} />
              </div>
            )}

            {/* Nom Commercial */}
            {names.nomCommercial && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Nom Commercial
                  </span>
                </div>
                <NameItem name={names.nomCommercial} onCopy={handleCopyName} />
              </div>
            )}

            {/* Enseignes */}
            {names.enseignes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Enseignes ({names.enseignes.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {names.enseignes.map((enseigne, index) => (
                    <NameItem key={index} name={enseigne} onCopy={handleCopyName} />
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sources :</span>
              {names.sources.map((source) => (
                <SourceBadge key={source} source={source} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Building2 className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Aucune dénomination trouvée</p>
            <Button variant="link" size="sm" onClick={handleRefresh} className="mt-2">
              Réessayer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Item de nom avec bouton de copie
 */
function NameItem({
  name,
  onCopy,
  isPrimary,
}: {
  name: string
  onCopy: (name: string) => void
  isPrimary?: boolean
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onCopy(name)}
            className="group flex w-full items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <span className={isPrimary ? 'font-semibold' : 'font-medium'}>{name}</span>
            <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Cliquer pour copier</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Badge de source
 */
function SourceBadge({ source }: { source: 'INPI' | 'ANNUAIRE' }) {
  if (source === 'INPI') {
    return (
      <Badge
        variant="outline"
        className="border-blue-300 bg-blue-50 text-blue-700 text-xs dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
      >
        <CheckCircle2 className="mr-1 h-3 w-3" />
        INPI
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="border-emerald-300 bg-emerald-50 text-emerald-700 text-xs dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
    >
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Annuaire
    </Badge>
  )
}
