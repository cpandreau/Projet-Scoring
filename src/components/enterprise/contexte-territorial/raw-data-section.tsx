'use client'

import { ChevronDown, ChevronRight, Database } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { TerritorialContext } from '@/types/territorial'

interface RawDataSectionProps {
  data: TerritorialContext
  selectedYear: number | undefined
}

/**
 * Section dépliable affichant les données brutes INSEE
 */
export function RawDataSection({ data, selectedYear }: RawDataSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="h-auto w-full justify-between p-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Voir les données brutes INSEE</span>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-4 pt-2">
          {/* Historique créations */}
          {data.indicateurs.historiqueCreations &&
            data.indicateurs.historiqueCreations.length > 0 && (
              <div>
                <h5 className="mb-2 font-medium text-sm">Créations d&apos;entreprises par année</h5>
                <div className="overflow-x-auto">
                  <table className="w-full rounded border text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Année</th>
                        <th className="p-2 text-right">Nombre</th>
                        <th className="p-2 text-right">Évolution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.indicateurs.historiqueCreations.map((item, i) => {
                        const prev = data.indicateurs.historiqueCreations?.[i - 1]
                        const evolution =
                          prev && prev.creations > 0
                            ? ((item.creations - prev.creations) / prev.creations) * 100
                            : null

                        return (
                          <tr key={item.annee} className="border-t">
                            <td className="p-2">{item.annee}</td>
                            <td className="p-2 text-right">
                              {item.creations.toLocaleString('fr-FR')}
                            </td>
                            <td className="p-2 text-right">
                              {evolution !== null ? (
                                <span
                                  className={cn(
                                    evolution > 0
                                      ? 'text-green-600'
                                      : evolution < 0
                                        ? 'text-red-600'
                                        : ''
                                  )}
                                >
                                  {evolution > 0 ? '+' : ''}
                                  {evolution.toFixed(1)}%
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Stock d'entreprises */}
          <div>
            <h5 className="mb-2 font-medium text-sm">Stock d&apos;entreprises</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded bg-muted p-3">
                <span className="text-muted-foreground">Secteur {data.secteur.codeA21} :</span>
                <span className="ml-2 font-medium">
                  {data.indicateurs.nbEntreprisesSecteur?.toLocaleString('fr-FR') ?? '—'}
                </span>
              </div>
              <div className="rounded bg-muted p-3">
                <span className="text-muted-foreground">Densité :</span>
                <span className="ml-2 font-medium">
                  {data.indicateurs.densitePour10000 ?? '—'} / 10 000 hab.
                </span>
              </div>
            </div>
          </div>

          {/* Source et date */}
          <div className="border-t pt-2 text-muted-foreground text-xs">
            <p>
              <strong>Source :</strong>{' '}
              {data.sources.map((s) => s.nom).join(', ') || 'INSEE Melodi - SIDE'}
            </p>
            <p>
              <strong>Département :</strong> {data.localisation.departement.code} -{' '}
              {data.localisation.departement.nom}
            </p>
            <p>
              <strong>Secteur NAF A21 :</strong> {data.secteur.codeA21} - {data.secteur.libelleA21}
            </p>
            <p>
              <strong>Année de référence :</strong> {selectedYear}
            </p>
            <p>
              <strong>Date de récupération :</strong>{' '}
              {new Date(data.dateCalcul).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
