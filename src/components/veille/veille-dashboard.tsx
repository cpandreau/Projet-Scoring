'use client'

import { Building2, Download, FileDown, RefreshCw, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { exportVeilleReport, type NewsResult, refreshNews } from '@/actions/news.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AnnuaireEntreprise } from '@/lib/api/annuaire-entreprises'
import type { NewsArticle } from '@/lib/api/google-news'
import type { PlaceReputation } from '@/lib/api/google-places'
import type { SectorTrendsResult } from '@/lib/api/google-trends'
import { cn } from '@/lib/utils'
import type { Enterprise } from '@/types/enterprise'
import { AnnuaireData } from './annuaire-data'
import { MethodologyTooltip } from './methodology-tooltip'
import { NewsList } from './news-list'
import { ReputationCard } from './reputation-card'
import { SectorTrends } from './sector-trends'

type PeriodFilter = '7d' | '30d' | '1y'

interface VeilleDashboardProps {
  enterprise: Enterprise
  newsData: NewsResult
  trendsData: SectorTrendsResult
  annuaireData: AnnuaireEntreprise | null
  reputationData: PlaceReputation
}

export function VeilleDashboard({
  enterprise,
  newsData,
  trendsData,
  annuaireData,
  reputationData,
}: VeilleDashboardProps) {
  const { companyNews, sectorNews, companyName, searchedNames } = newsData
  const companyMethodology = companyNews.methodology
  const sectorMethodology = sectorNews.methodology

  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)
  const [period, setPeriod] = useState<PeriodFilter>('30d')
  const [sectorSourceFilter, setSectorSourceFilter] = useState<string>('all')

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshNews(enterprise.id)
    })
  }

  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      const result = await exportVeilleReport({
        enterprise: {
          nom: enterprise.raison_sociale || 'Entreprise',
          siren: enterprise.siren,
          nafCode: enterprise.code_naf,
        },
        companyName,
        trends: trendsData,
        reputation: reputationData,
        annuaire: annuaireData,
        companyNews: filteredCompanyNews,
        sectorNews: filteredSectorNews,
        sectorMethodology,
        period: periodLabels[period],
      })

      // Convertir le tableau en Uint8Array et créer le blob
      const pdfBytes = new Uint8Array(result.data)
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      // Télécharger le fichier
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur export PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Filtrer les articles par période
  const filterByPeriod = useMemo(() => {
    return (articles: NewsArticle[]) => {
      const now = new Date()
      const cutoff = new Date()

      switch (period) {
        case '7d':
          cutoff.setDate(now.getDate() - 7)
          break
        case '30d':
          cutoff.setDate(now.getDate() - 30)
          break
        case '1y':
          cutoff.setFullYear(now.getFullYear() - 1)
          break
      }

      return articles.filter((article) => {
        if (!article.pubDate) return true
        const articleDate = new Date(article.pubDate)
        return articleDate >= cutoff
      })
    }
  }, [period])

  const filteredCompanyNews = useMemo(
    () => filterByPeriod(companyNews.articles),
    [filterByPeriod, companyNews.articles]
  )

  const sectorNewsAfterPeriod = useMemo(
    () => filterByPeriod(sectorNews.articles),
    [filterByPeriod, sectorNews.articles]
  )

  // Reset le filtre source quand la période change
  useEffect(() => {
    setSectorSourceFilter('all')
  }, [period])

  // Extraire les sources uniques des articles secteur
  const sectorSources = useMemo(() => {
    const sources = new Set(sectorNewsAfterPeriod.map((a) => a.source))
    return Array.from(sources).sort()
  }, [sectorNewsAfterPeriod])

  // Appliquer le filtre par source
  const filteredSectorNews = useMemo(() => {
    if (sectorSourceFilter === 'all') return sectorNewsAfterPeriod
    return sectorNewsAfterPeriod.filter((a) => a.source === sectorSourceFilter)
  }, [sectorNewsAfterPeriod, sectorSourceFilter])

  const periodLabels: Record<PeriodFilter, string> = {
    '7d': '7 jours',
    '30d': '30 jours',
    '1y': '1 an',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Veille</h1>
          <p className="text-muted-foreground">
            Actualités et tendances pour {enterprise.raison_sociale}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="gap-2"
          >
            <FileDown className={cn('h-4 w-4', isExporting && 'animate-pulse')} />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Row 1: Trends + Annuaire + Réputation (3 colonnes sur grand écran) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SectorTrends trends={trendsData} />
        <AnnuaireData data={annuaireData} siren={enterprise.siren ?? undefined} />
        <ReputationCard reputation={reputationData} companyName={companyName} />
      </div>

      {/* Row 2: News avec filtres */}
      <div className="space-y-4">
        {/* Filtres période */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Actualités</h2>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <TabsList>
              <TabsTrigger value="7d">7 jours</TabsTrigger>
              <TabsTrigger value="30d">30 jours</TabsTrigger>
              <TabsTrigger value="1y">1 an</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* News Entreprise */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Actualités entreprise</CardTitle>
                </div>
                <MethodologyTooltip
                  source={companyMethodology.source}
                  searchedNames={searchedNames}
                  query={companyMethodology.searchQuery}
                  filters={companyMethodology.filters}
                  zone={companyMethodology.zone}
                  period={periodLabels[period]}
                />
              </div>
              <CardDescription>Mentions de « {companyName} » dans la presse</CardDescription>
            </CardHeader>
            <CardContent>
              <NewsList
                articles={filteredCompanyNews}
                emptyMessage={`Aucune actualité sur les ${periodLabels[period]} derniers`}
                emptySubMessage="Les PME sont rarement mentionnées dans les médias nationaux"
                initialCount={5}
              />
            </CardContent>
          </Card>

          {/* News Secteur */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Actualités secteur</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {sectorSources.length > 1 && (
                    <Select value={sectorSourceFilter} onValueChange={setSectorSourceFilter}>
                      <SelectTrigger size="sm" className="h-7 w-auto min-w-[120px] text-xs">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les sources</SelectItem>
                        {sectorSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <MethodologyTooltip
                    source={sectorMethodology.source}
                    nafCode={sectorMethodology.nafCode}
                    nafLabel={sectorMethodology.nafLabel}
                    keywords={sectorMethodology.keywords}
                    query={sectorMethodology.query}
                    zone={sectorMethodology.zone}
                    period={periodLabels[period]}
                  />
                </div>
              </div>
              <CardDescription>Tendances du secteur : {sectorMethodology.nafLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <NewsList
                articles={filteredSectorNews}
                emptyMessage={`Aucune actualité sur les ${periodLabels[period]} derniers`}
                initialCount={5}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
