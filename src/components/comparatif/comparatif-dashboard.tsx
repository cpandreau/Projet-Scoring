'use client'

import { AlertCircle, AlertTriangle, Building2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { EnterpriseScoreResult } from '@/actions/score.actions'
import { getSectorComparison } from '@/actions/sector-comparison.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { type FamilyId, RATIO_FAMILIES } from '@/config/ratios.config'
import { RATIOS_BENCHMARK_CONFIG } from '@/lib/api/ratios-benchmark-config'
import { extractQuartiles } from '@/lib/api/sector-benchmarks-mapping'
import type { PositionSectorielle, SectorComparisonResult } from '@/lib/api/sector-comparison'
import { FamilleRatiosComparison, type RatioData } from './famille-ratios-comparison'

const FAMILY_ORDER: FamilyId[] = [
  'liquidite',
  'rentabilite',
  'solvabilite',
  'activite',
  'evolution',
]

interface ComparatifDashboardProps {
  enterpriseId: string
  scoreResult: EnterpriseScoreResult
}

function getScoreColor(score: number): string {
  if (score >= 7) return 'text-green-600'
  if (score >= 5) return 'text-blue-600'
  if (score >= 3) return 'text-orange-500'
  return 'text-red-600'
}

/**
 * Calcule la position sectorielle d'une valeur par rapport aux quartiles
 */
function getPosition(
  valeur: number,
  q10: number | null,
  q25: number | null,
  q50: number | null,
  q75: number | null,
  q90: number | null,
  sensInverse: boolean
): PositionSectorielle {
  if (q10 === null || q25 === null || q50 === null || q75 === null || q90 === null) {
    return 'non_disponible'
  }

  if (sensInverse) {
    if (valeur <= q10) return 'top10'
    if (valeur <= q25) return 'top25'
    if (valeur <= q50) return 'median_sup'
    if (valeur <= q75) return 'median_inf'
    if (valeur <= q90) return 'bottom25'
    return 'bottom10'
  }

  if (valeur >= q90) return 'top10'
  if (valeur >= q75) return 'top25'
  if (valeur >= q50) return 'median_sup'
  if (valeur >= q25) return 'median_inf'
  if (valeur >= q10) return 'bottom25'
  return 'bottom10'
}

/**
 * Estime le percentile (0-100)
 */
function estimerPercentile(
  valeur: number,
  q10: number | null,
  q25: number | null,
  q50: number | null,
  q75: number | null,
  q90: number | null,
  sensInverse: boolean
): number {
  if (q10 === null || q25 === null || q50 === null || q75 === null || q90 === null) {
    return 50
  }

  let percentile: number

  if (valeur <= q10) {
    percentile = 5
  } else if (valeur <= q25) {
    percentile = 10 + 15 * ((valeur - q10) / (q25 - q10 || 1))
  } else if (valeur <= q50) {
    percentile = 25 + 25 * ((valeur - q25) / (q50 - q25 || 1))
  } else if (valeur <= q75) {
    percentile = 50 + 25 * ((valeur - q50) / (q75 - q50 || 1))
  } else if (valeur <= q90) {
    percentile = 75 + 15 * ((valeur - q75) / (q90 - q75 || 1))
  } else {
    percentile = 95
  }

  if (sensInverse) {
    percentile = 100 - percentile
  }

  return Math.round(Math.max(0, Math.min(100, percentile)))
}

export function ComparatifDashboard({ enterpriseId, scoreResult }: ComparatifDashboardProps) {
  const [sectorData, setSectorData] = useState<SectorComparisonResult | null>(null)
  const [benchmarkRecord, setBenchmarkRecord] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const anneesDisponibles = scoreResult.anneesDisponibles || []
  const currentYear = selectedYear || anneesDisponibles[0]

  // Trouver le score de l'année sélectionnée
  const currentYearScore = scoreResult.scoresParAnnee?.find((s) => s.annee === currentYear)

  // Récupérer les ratios calculés pour l'année courante (format: { ratioId: RatioDetail })
  const detailRatios = currentYearScore?.score?.detailRatios || {}

  useEffect(() => {
    async function loadSectorData() {
      if (!currentYear) return
      setLoading(true)
      const result = await getSectorComparison(enterpriseId, currentYear)
      setSectorData(result)

      // Stocker le record brut pour extraire les quartiles manuellement
      // Note: On utilise les comparisons existantes comme base
      if (result && !result.error && result.comparisons.length > 0) {
        // Créer un record à partir des comparisons pour le mapping
        const record: Record<string, unknown> = {}
        for (const comp of result.comparisons) {
          // Trouver le prefix API à partir du ratioId
          const config = Object.values(RATIOS_BENCHMARK_CONFIG)
            .flat()
            .find((r) => r.id === comp.ratioId || r.ratioKey === comp.ratioId)
          if (config?.apiPrefix) {
            record[`${config.apiPrefix}_q10`] = comp.q10
            record[`${config.apiPrefix}_q25`] = comp.q25
            record[`${config.apiPrefix}_q50`] = comp.q50
            record[`${config.apiPrefix}_q75`] = comp.q75
            record[`${config.apiPrefix}_q90`] = comp.q90
          }
        }
        setBenchmarkRecord(record)
      } else {
        setBenchmarkRecord(null)
      }

      setLoading(false)
    }
    loadSectorData()
  }, [enterpriseId, currentYear])

  // Pas de données disponibles
  if (!scoreResult.hasValidatedData || !scoreResult.score) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Aucune donnée validée disponible pour effectuer la comparaison. Veuillez d&apos;abord
          extraire et valider une liasse fiscale.
        </AlertDescription>
      </Alert>
    )
  }

  // Calculer l'écart d'années
  const exerciceSecteurNum = sectorData?.exerciceSecteur
    ? parseInt(sectorData.exerciceSecteur, 10)
    : 0
  const ecartAnnees =
    currentYear && exerciceSecteurNum ? Math.abs(currentYear - exerciceSecteurNum) : 0

  // Préparer les données de ratios par famille
  const ratiosParFamille = FAMILY_ORDER.map((familleId) => {
    const familyConfig = RATIOS_BENCHMARK_CONFIG[familleId] || []
    const familyDef = RATIO_FAMILIES[familleId]

    const ratios: RatioData[] = familyConfig.map((config) => {
      // Obtenir la valeur du ratio calculé (detailRatios contient { id, nom, valeur, zone, points, pointsMax })
      const ratioDetail = detailRatios[config.id]
      const ratioValue = ratioDetail?.valeur ?? null

      // Obtenir le benchmark si disponible
      let benchmark = null
      let position: PositionSectorielle | undefined
      let percentile: number | undefined
      let ecartMediane: number | null = null

      if (config.apiPrefix && benchmarkRecord) {
        const quartiles = extractQuartiles(benchmarkRecord, config.apiPrefix)
        if (quartiles.q50 !== null) {
          benchmark = quartiles

          if (ratioValue !== null) {
            position = getPosition(
              ratioValue,
              quartiles.q10,
              quartiles.q25,
              quartiles.q50,
              quartiles.q75,
              quartiles.q90,
              !config.higherIsBetter
            )

            percentile = estimerPercentile(
              ratioValue,
              quartiles.q10,
              quartiles.q25,
              quartiles.q50,
              quartiles.q75,
              quartiles.q90,
              !config.higherIsBetter
            )

            if (quartiles.q50 !== null && quartiles.q50 !== 0) {
              ecartMediane = ((ratioValue - quartiles.q50) / Math.abs(quartiles.q50)) * 100
            }
          }
        }
      }

      return {
        id: config.id,
        name: config.name,
        value: ratioValue,
        unit: config.unit,
        benchmark,
        higherIsBetter: config.higherIsBetter,
        position,
        percentile,
        ecartMediane,
      }
    })

    return {
      familleId,
      familleName: familyDef.nom,
      ratios,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur d'année */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg">Comparatif sectoriel</h2>
          <p className="text-muted-foreground text-sm">
            Comparez vos ratios aux entreprises de votre secteur
          </p>
        </div>

        {anneesDisponibles.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Exercice :</span>
            <Select
              value={currentYear?.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v, 10))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anneesDisponibles.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Warning si écart d'années */}
      {ecartAnnees > 1 && sectorData && !sectorData.error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Données sectorielles non disponibles pour {currentYear}. Comparaison basée sur les
            données {sectorData.exerciceSecteur} (écart de {ecartAnnees} ans).
          </AlertDescription>
        </Alert>
      )}

      {/* En-tête secteur */}
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : sectorData && !sectorData.error ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Benchmark sectoriel</CardTitle>
                  <CardDescription>
                    NAF {sectorData.classeNaf} • {sectorData.classeCA} •{' '}
                    {sectorData.cohorte.toLocaleString()} entreprises
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Données {sectorData.exerciceSecteur}</Badge>
                {currentYearScore && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Score global</span>
                    <span
                      className={`font-bold text-lg ${getScoreColor(currentYearScore.score.scoreGlobal)}`}
                    >
                      {currentYearScore.score.scoreGlobal.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      ) : sectorData?.error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{sectorData.error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Ratios par famille */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {ratiosParFamille.map(({ familleId, familleName, ratios }) => (
            <FamilleRatiosComparison
              key={familleId}
              familleId={familleId}
              familleName={familleName}
              ratios={ratios}
              defaultExpanded={familleId !== 'evolution'}
            />
          ))}
        </div>
      )}

      {/* Source */}
      {sectorData && !sectorData.error && (
        <p className="text-center text-muted-foreground text-xs">
          Source : API data.economie.gouv.fr (BCE/INPI) - Données sectorielles{' '}
          {sectorData.exerciceSecteur}
        </p>
      )}
    </div>
  )
}
