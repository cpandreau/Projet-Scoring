'use client'

import { ExternalLink, Minus, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkline } from '@/components/ui/sparkline'
import type { SectorTrendsResult } from '@/lib/api/google-trends'
import { MethodologyTooltip } from './methodology-tooltip'

interface SectorTrendsProps {
  trends: SectorTrendsResult
}

export function SectorTrends({ trends }: SectorTrendsProps) {
  const { mainTrend, relatedQueries, methodology, error } = trends
  const sectorLabel = methodology?.nafLabel || 'Secteur'

  if (error || !mainTrend) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tendances de recherche</CardTitle>
            </div>
            {methodology && (
              <MethodologyTooltip
                source={methodology.source}
                nafCode={methodology.nafCode}
                nafLabel={methodology.nafLabel}
                zone={methodology.zone}
                period={methodology.period}
              />
            )}
          </div>
          <CardDescription>Google Trends pour le secteur {sectorLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {error || 'Données de tendances non disponibles'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TrendIcon =
    mainTrend.trend === 'up' ? TrendingUp : mainTrend.trend === 'down' ? TrendingDown : Minus

  const trendColor =
    mainTrend.trend === 'up'
      ? 'text-green-600'
      : mainTrend.trend === 'down'
        ? 'text-red-600'
        : 'text-muted-foreground'

  const trendBadgeVariant =
    mainTrend.trend === 'up' ? 'default' : mainTrend.trend === 'down' ? 'destructive' : 'secondary'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Tendances de recherche</CardTitle>
          </div>
          {methodology && (
            <MethodologyTooltip
              source={methodology.source}
              nafCode={methodology.nafCode}
              nafLabel={methodology.nafLabel}
              keywords={[methodology.keyword]}
              zone={methodology.zone}
              period={methodology.period}
            />
          )}
        </div>
        <CardDescription>
          Intérêt pour « {mainTrend.keyword} » ({sectorLabel}) sur 12 mois
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trend summary */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm text-muted-foreground">Tendance</p>
            <div className="mt-1 flex items-center gap-2">
              <TrendIcon className={`h-5 w-5 ${trendColor}`} />
              <span className="font-semibold">
                {mainTrend.trend === 'up' && 'En hausse'}
                {mainTrend.trend === 'down' && 'En baisse'}
                {mainTrend.trend === 'stable' && 'Stable'}
              </span>
              {mainTrend.trendPercentage !== 0 && (
                <Badge variant={trendBadgeVariant}>
                  {mainTrend.trendPercentage > 0 ? '+' : ''}
                  {mainTrend.trendPercentage}%
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Intérêt moyen</p>
            <p className="text-2xl font-bold">{mainTrend.averageInterest}</p>
            <p className="text-xs text-muted-foreground">/ 100</p>
          </div>
        </div>

        {/* Sparkline */}
        {mainTrend.timeline.length > 0 && (
          <div className="flex items-center justify-center rounded-lg bg-muted/30 p-3">
            <Sparkline
              data={mainTrend.timeline.map((t) => t.value)}
              width={280}
              height={48}
              color="auto"
              showArea
              showEndpoint
            />
          </div>
        )}

        {/* Related queries */}
        {relatedQueries.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Recherches associées</p>
            <div className="flex flex-wrap gap-2">
              {relatedQueries.map((query, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lien vers Google Trends */}
        <a
          href={`https://trends.google.fr/trends/explore?q=${encodeURIComponent(mainTrend.keyword)}&geo=FR&hl=fr`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-2 rounded-md border p-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Explorer sur Google Trends
        </a>
      </CardContent>
    </Card>
  )
}
