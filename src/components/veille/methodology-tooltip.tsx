'use client'

import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MethodologyTooltipProps {
  source: string
  nafCode?: string
  nafLabel?: string
  keywords?: string[]
  searchedNames?: string[] // Noms recherchés (entreprise)
  query?: string
  filters?: string[]
  zone: string
  period: string
}

export function MethodologyTooltip({
  source,
  nafCode,
  nafLabel,
  keywords,
  searchedNames,
  query,
  filters,
  zone,
  period,
}: MethodologyTooltipProps) {
  // Détecter si c'est une recherche secteur (avec NAF) ou entreprise
  const isSectorSearch = !!nafCode
  const isCompanySearch = !!searchedNames?.length

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Méthodologie</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <div className="border-b pb-1 font-medium">Méthodologie de recherche</div>

            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
              <span className="text-muted-foreground">Source :</span>
              <span>{source}</span>

              {searchedNames && searchedNames.length > 0 && (
                <>
                  <span className="text-muted-foreground">Noms recherchés :</span>
                  <span className="break-words">
                    {searchedNames.map((n) => `"${n}"`).join(', ')}
                  </span>
                </>
              )}

              {nafCode && (
                <>
                  <span className="text-muted-foreground">Code NAF :</span>
                  <span>{nafCode}</span>
                </>
              )}

              {nafLabel && (
                <>
                  <span className="text-muted-foreground">Secteur :</span>
                  <span>{nafLabel}</span>
                </>
              )}

              {keywords && keywords.length > 0 && (
                <>
                  <span className="text-muted-foreground">Mots-clés :</span>
                  <span className="break-words">{keywords.map((k) => `"${k}"`).join(', ')}</span>
                </>
              )}

              {query && (
                <>
                  <span className="text-muted-foreground">Requête :</span>
                  <span className="break-words font-mono text-[10px]">{query}</span>
                </>
              )}

              {filters && filters.length > 0 && (
                <>
                  <span className="text-muted-foreground">Exclusions :</span>
                  <span className="break-words text-[10px]">
                    {filters.map((f) => `-${f}`).join(' ')}
                  </span>
                </>
              )}

              <span className="text-muted-foreground">Zone :</span>
              <span>{zone}</span>

              <span className="text-muted-foreground">Période :</span>
              <span>{period}</span>
            </div>

            {isSectorSearch && (
              <div className="border-t pt-1 text-[10px] text-muted-foreground">
                Libellé NAF fourni par l'API INSEE Métadonnées
              </div>
            )}
            {isCompanySearch && searchedNames.length > 1 && (
              <div className="border-t pt-1 text-[10px] text-muted-foreground">
                Noms enrichis via l'API Annuaire Entreprises
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
