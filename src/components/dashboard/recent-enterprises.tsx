'use client'

import { ArrowRight, BarChart3, Building, ChevronDown, FileText } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EnterpriseLink } from '@/components/enterprise/enterprise-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getScoreZone, getZoneTextClasses } from '@/config/colors.config'
import { cn } from '@/lib/utils'
import type { RecentEnterprise } from '@/repositories/stats.repository'
import { STATUT_COLORS, STATUT_LABELS } from '@/types'

interface RecentEnterprisesProps {
  enterprises: RecentEnterprise[]
  initialCount?: number
  maxCount?: number
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

/**
 * Retourne les classes de bordure gauche selon le score
 */
function getScoreBorderClass(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'border-l-4 border-l-muted'
  }
  if (score < 4) return 'border-l-4 border-l-red-500'
  if (score < 6) return 'border-l-4 border-l-orange-500'
  if (score < 8) return 'border-l-4 border-l-yellow-500'
  return 'border-l-4 border-l-green-500'
}

export function RecentEnterprises({
  enterprises,
  initialCount = 5,
  maxCount = 15,
}: RecentEnterprisesProps) {
  const [showCount, setShowCount] = useState(initialCount)

  const visibleEnterprises = enterprises.slice(0, showCount)
  const hasMore = enterprises.length > showCount
  const canShowMore = showCount < maxCount && hasMore
  const remainingCount = Math.min(5, enterprises.length - showCount)

  if (enterprises.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-medium text-sm">
            <Building className="h-4 w-4" />
            Dossiers récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="mb-4 text-muted-foreground text-sm">Aucun dossier pour le moment</p>
            <Button asChild size="sm">
              <Link href="/enterprise/new">Créer un dossier</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 font-medium text-sm">
            <Building className="h-4 w-4" />
            Dossiers récents
          </CardTitle>
          <CardDescription className="mt-1">
            {enterprises.length} dossier{enterprises.length > 1 ? 's' : ''} au total
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild className="text-xs">
          <Link href="/enterprise">
            Voir tout
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleEnterprises.map((enterprise) => {
          const zone = enterprise.score !== null ? getScoreZone(enterprise.score) : null

          return (
            <div key={enterprise.id} className="group relative">
              <EnterpriseLink
                enterprise={enterprise}
                className={cn(
                  'flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:bg-muted/50',
                  getScoreBorderClass(enterprise.score)
                )}
              >
                <div className="min-w-0 flex-1 pr-20">
                  <p className="truncate font-medium text-sm">
                    {enterprise.raison_sociale || 'Sans nom'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(enterprise.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {enterprise.score !== null && zone && (
                    <span
                      className={cn('font-bold text-base tabular-nums', getZoneTextClasses(zone))}
                    >
                      {enterprise.score.toFixed(1)}
                    </span>
                  )}
                  <Badge
                    variant="secondary"
                    className={cn('text-xs', STATUT_COLORS[enterprise.statut])}
                  >
                    {STATUT_LABELS[enterprise.statut]}
                  </Badge>
                </div>
              </EnterpriseLink>

              {/* Actions rapides au hover */}
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1 rounded-md bg-card/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <EnterpriseLink
                    enterprise={enterprise}
                    section="score"
                    onClick={(e) => e.stopPropagation()}
                    title="Voir le score"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span className="sr-only">Voir le score</span>
                  </EnterpriseLink>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <EnterpriseLink
                    enterprise={enterprise}
                    section="documents"
                    onClick={(e) => e.stopPropagation()}
                    title="Voir les documents"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="sr-only">Voir les documents</span>
                  </EnterpriseLink>
                </Button>
              </div>
            </div>
          )
        })}

        {/* Bouton Afficher plus */}
        {canShowMore && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowCount((prev) => Math.min(prev + 5, maxCount))}
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            Afficher plus ({remainingCount} suivants)
          </Button>
        )}

        {/* Lien vers la liste complète */}
        {!canShowMore && hasMore && (
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/enterprise">
              Voir tous les dossiers ({enterprises.length})
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
