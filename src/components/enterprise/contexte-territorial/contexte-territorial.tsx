'use client'

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Lightbulb,
  MapPin,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScoreBarGauge } from '@/components/ui/score-bar-gauge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useTerritorialContext } from '@/hooks'
import { cn } from '@/lib/utils'
import {
  getDepartementName,
  getRegionFromDepartement,
  getRegionName,
} from '@/lib/utils/geo-mapping'

import { SANTE_CONFIG, TENDANCE_CONFIG } from './config'
import type { ContexteTerritorialProps } from './contexte-territorial.types'
import { generateInsights } from './insights-generator'
import { ContexteTerritorialSkeleton } from './loading-skeleton'
import { RawDataSection } from './raw-data-section'
import { ScoreBreakdown } from './score-section'

// Lazy load du chart Recharts
const CreationsEvolutionChart = dynamic(
  () => import('./creations-evolution-chart').then((m) => m.CreationsEvolutionChart),
  { loading: () => <Skeleton className="h-37.5 w-full" />, ssr: false }
)

/**
 * Dashboard de contexte territorial avec score, stats INSEE et insights
 */
export function ContexteTerritorial({
  siren,
  codeNAF,
  codeDepartement,
  scoreResult,
}: ContexteTerritorialProps) {
  const { data, isLoading, error, availableYears, selectedYear, setSelectedYear } =
    useTerritorialContext(siren, codeNAF, codeDepartement)

  // Calculer les noms réels à partir des mappings
  const nomDepartement = getDepartementName(codeDepartement)
  const codeRegion = getRegionFromDepartement(codeDepartement)
  const nomRegion = codeRegion ? getRegionName(codeRegion) : null

  // Generate insights
  const insights = useMemo(() => {
    if (!data) return []
    return generateInsights(data, scoreResult, nomDepartement)
  }, [data, scoreResult, nomDepartement])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data?.indicateurs.historiqueCreations) return []
    return data.indicateurs.historiqueCreations.map((item) => ({
      annee: item.annee.toString(),
      creations: item.creations,
    }))
  }, [data])

  // Loading state
  if (isLoading) {
    return <ContexteTerritorialSkeleton />
  }

  // Error or no data state
  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Données contextuelles non disponibles.
          {error && ` Erreur : ${error.message}`}
        </AlertDescription>
      </Alert>
    )
  }

  const hasAnyInseeData =
    data.indicateurs.nbEntreprisesSecteur !== undefined ||
    data.indicateurs.creationsAnnee !== undefined

  const evolutionTrend: 'up' | 'down' | 'stable' | undefined =
    data.indicateurs.evolutionCreations !== undefined
      ? data.indicateurs.evolutionCreations > 0
        ? 'up'
        : data.indicateurs.evolutionCreations < 0
          ? 'down'
          : 'stable'
      : undefined

  const hasScore = scoreResult.success && scoreResult.score

  return (
    <div className="space-y-6">
      {/* Header with year selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            Contexte territorial
          </h3>
          <p className="text-muted-foreground text-sm">
            {nomDepartement} ({codeDepartement}) •{' '}
            {data.secteur.libelleA21 || data.secteur.libelleNAF}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="annee-select" className="font-medium text-sm">
            Année :
          </Label>
          <Select
            value={selectedYear?.toString() ?? ''}
            onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
          >
            <SelectTrigger id="annee-select" className="w-24">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section 1: Score with Gauge (from real score) */}
      {hasScore ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              Score de santé financière
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBarGauge score={scoreResult.score?.scoreGlobal ?? 0} />
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Score non disponible. Veuillez d&apos;abord extraire et valider les données d&apos;une
            liasse fiscale dans l&apos;onglet Documents.
          </AlertDescription>
        </Alert>
      )}

      {/* Section 2: Score Breakdown */}
      {hasScore && <ScoreBreakdown scoreResult={scoreResult} />}

      {/* Section 3: Key Statistics (INSEE data) */}
      {!hasAnyInseeData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune donnée INSEE disponible pour ce département et ce secteur d&apos;activité pour
            l&apos;année {selectedYear}.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Entreprises du secteur"
          value={data.indicateurs.nbEntreprisesSecteur?.toLocaleString('fr-FR') ?? '—'}
          sublabel={`dans ${nomDepartement}`}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label={`Créations ${selectedYear ?? ''}`}
          value={data.indicateurs.creationsAnnee?.toLocaleString('fr-FR') ?? '—'}
          sublabel={
            data.indicateurs.evolutionCreations !== undefined
              ? `${data.indicateurs.evolutionCreations > 0 ? '+' : ''}${data.indicateurs.evolutionCreations.toFixed(1)}% vs N-1`
              : undefined
          }
          trend={evolutionTrend}
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Densité"
          value={data.indicateurs.densitePour10000?.toString() ?? '—'}
          sublabel="entreprises / 10 000 hab."
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Santé du secteur"
          value={
            data.indicateurs.santeSecteur ? SANTE_CONFIG[data.indicateurs.santeSecteur].emoji : '—'
          }
          sublabel={
            data.indicateurs.santeSecteur
              ? SANTE_CONFIG[data.indicateurs.santeSecteur].label
              : 'Non déterminé'
          }
        />
      </div>

      {/* Section 4: Démographie régionale (tous secteurs) - seulement si données complètes */}
      {data.indicateurs.demographieRegion && data.indicateurs.demographieRegion.cessations > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Démographie des entreprises ({nomRegion || data.indicateurs.nomRegion || 'Région'})
            </CardTitle>
            <CardDescription>
              Mouvements d&apos;entreprises tous secteurs confondus (
              {data.indicateurs.demographieRegion.annee})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950/30">
                <div className="font-bold text-2xl text-green-600">
                  +{data.indicateurs.demographieRegion.creations.toLocaleString('fr-FR')}
                </div>
                <div className="text-muted-foreground text-sm">Créations</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-950/30">
                <div className="font-bold text-2xl text-red-600">
                  -{data.indicateurs.demographieRegion.cessations.toLocaleString('fr-FR')}
                </div>
                <div className="text-muted-foreground text-sm">Cessations</div>
              </div>
              <div
                className={cn(
                  'rounded-lg p-3 text-center',
                  data.indicateurs.demographieRegion.soldeNet >= 0
                    ? 'bg-green-50 dark:bg-green-950/30'
                    : 'bg-red-50 dark:bg-red-950/30'
                )}
              >
                <div
                  className={cn(
                    'font-bold text-2xl',
                    data.indicateurs.demographieRegion.soldeNet >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {data.indicateurs.demographieRegion.soldeNet >= 0 ? '+' : ''}
                  {data.indicateurs.demographieRegion.soldeNet.toLocaleString('fr-FR')}
                </div>
                <div className="text-muted-foreground text-sm">Solde net</div>
              </div>
              {data.indicateurs.demographieRegion.tauxCessation !== undefined && (
                <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
                  <div className="font-bold text-2xl">
                    {data.indicateurs.demographieRegion.tauxCessation.toFixed(1)}%
                  </div>
                  <div className="text-muted-foreground text-sm">Taux de cessation</div>
                </div>
              )}
            </div>

            {data.indicateurs.demographieRegion.soldeNet < 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Le secteur perd plus d&apos;entreprises qu&apos;il n&apos;en crée dans la région
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 5: Contexte économique local */}
      {data.indicateurs.contexteEconomique && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              Contexte économique local
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {data.indicateurs.contexteEconomique.tauxChomage !== undefined && (
                <div>
                  <div className="text-muted-foreground text-sm">
                    Taux de chômage ({data.indicateurs.contexteEconomique.anneeChomage})
                  </div>
                  <div className="font-bold text-xl">
                    {data.indicateurs.contexteEconomique.tauxChomage.toFixed(1)}%
                  </div>
                </div>
              )}
              {data.indicateurs.contexteEconomique.revenuMedian !== undefined && (
                <div>
                  <div className="text-muted-foreground text-sm">
                    Revenu médian ({data.indicateurs.contexteEconomique.anneeRevenu})
                  </div>
                  <div className="font-bold text-xl">
                    {data.indicateurs.contexteEconomique.revenuMedian.toLocaleString('fr-FR')} €
                  </div>
                </div>
              )}
              {data.indicateurs.contexteEconomique.pibRegional !== undefined && (
                <div>
                  <div className="text-muted-foreground text-sm">
                    PIB régional ({data.indicateurs.contexteEconomique.anneePib})
                  </div>
                  <div className="font-bold text-xl">
                    {(data.indicateurs.contexteEconomique.pibRegional / 1000).toFixed(0)} Mds €
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 6: Effectifs du secteur */}
      {data.indicateurs.effectifsSecteur && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              Effectifs du secteur dans le département ({data.indicateurs.effectifsSecteur.annee})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-muted-foreground text-sm">Salariés</div>
                <div className="font-bold text-xl">
                  {data.indicateurs.effectifsSecteur.effectifTotal.toLocaleString('fr-FR')}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Établissements</div>
                <div className="font-bold text-xl">
                  {data.indicateurs.effectifsSecteur.nombreEtablissements.toLocaleString('fr-FR')}
                </div>
              </div>
              {data.indicateurs.effectifsSecteur.effectifMoyen !== undefined && (
                <div>
                  <div className="text-muted-foreground text-sm">Effectif moyen</div>
                  <div className="font-bold text-xl">
                    {data.indicateurs.effectifsSecteur.effectifMoyen} sal./étab.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 7: Evolution Chart + Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Evolution Chart */}
        <Card className={chartData.length === 0 ? 'opacity-60' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Évolution des créations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <CreationsEvolutionChart chartData={chartData} selectedYear={selectedYear} />
            ) : (
              <p className="py-8 text-center text-muted-foreground text-sm italic">
                Historique non disponible
              </p>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              Points clés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <ul className="space-y-2">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Pas suffisamment de données pour générer des insights
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 8: Location details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Détails géographiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Région</dt>
              <dd className="font-medium">{nomRegion || 'Non déterminée'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Département</dt>
              <dd className="font-medium">
                {nomDepartement} ({codeDepartement})
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Population</dt>
              <dd className="font-medium">
                {data.localisation.departement.population
                  ? `${(data.localisation.departement.population / 1000000).toFixed(2)}M hab.`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Secteur NAF</dt>
              <dd className="font-medium">{data.secteur.codeA21 || data.secteur.codeNAF}</dd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 9: Raw data (collapsible) */}
      <Card>
        <RawDataSection data={data} selectedYear={selectedYear} />
      </Card>

      {/* Footer: Sources */}
      {data.sources.length > 0 && (
        <p className="text-muted-foreground text-xs">
          Sources : {data.sources.map((s) => s.nom).join(', ')} • Données INSEE {selectedYear}
        </p>
      )}
    </div>
  )
}
