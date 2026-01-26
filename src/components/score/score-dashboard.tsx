'use client'

import { AlertCircle, FileDown, Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { generateScoreReportPDF } from '@/actions/pdf.actions'
import type { YearScore } from '@/actions/score.actions'
import { recalculateAndSaveScore } from '@/actions/score-history.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { FamilyId } from '@/config/ratios.config'
import type { ScoreResult } from '@/lib/ratios'
import { showError, showSuccess } from '@/lib/toast'
import type { ExtractionValues } from '@/schemas/extraction.schema'
import { RatioDebug } from './ratio-debug'
import { ScoreFamille } from './score-famille'
import { ScoreGlobal } from './score-global'

// Lazy load des composants Recharts (lourd ~40kb)
const ScoreEvolutionChart = dynamic(
  () => import('./score-evolution-chart').then((m) => m.ScoreEvolutionChart),
  { loading: () => <Skeleton className="h-[200px] w-full" />, ssr: false }
)

const ScoreRadar = dynamic(() => import('./score-radar').then((m) => m.ScoreRadar), {
  loading: () => <Skeleton className="h-[250px] w-full" />,
  ssr: false,
})

interface ScoreDashboardProps {
  enterpriseId: string
  score: ScoreResult
  scoresParAnnee?: YearScore[]
  extractionData?: ExtractionValues // Pour le debug des calculs
}

const FAMILY_ORDER: FamilyId[] = [
  'liquidite',
  'rentabilite',
  'solvabilite',
  'activite',
  'evolution',
]

export function ScoreDashboard({
  enterpriseId,
  score,
  scoresParAnnee,
  extractionData,
}: ScoreDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const result = await generateScoreReportPDF(enterpriseId)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Erreur lors de la génération')
      }

      // Décoder le base64 et créer le blob
      const binaryString = atob(result.data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })

      // Créer le lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename || 'rapport-score.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showSuccess('Téléchargé', 'Rapport PDF téléchargé avec succès')
    } catch (error) {
      console.error('Erreur export PDF:', error)
      showError('Erreur', "Erreur lors de l'export du PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const handleRecalculate = () => {
    startTransition(async () => {
      const result = await recalculateAndSaveScore(enterpriseId)

      if (result.success) {
        showSuccess(
          'Score recalculé',
          result.scoreGlobal !== undefined
            ? `Nouveau score : ${result.scoreGlobal.toFixed(1)}/10`
            : undefined
        )
        router.refresh()
      } else {
        showError('Erreur', result.error || 'Impossible de recalculer le score')
      }
    })
  }

  const { statistiques } = score
  const hasMultiYearData = scoresParAnnee && scoresParAnnee.length > 1

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* En-tête avec score global et radar */}
      <div className="grid grid-cols-1 items-center gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Score global - centré sur mobile */}
        <div className="order-1 flex justify-center">
          <ScoreGlobal score={score.scoreGlobal} ratiosExclus={statistiques.ratiosExclus} />
        </div>

        {/* Radar des familles */}
        <div className="order-2 md:order-2 lg:col-span-1">
          <ScoreRadar scoreParFamille={score.scoreParFamille} scoreGlobal={score.scoreGlobal} />
        </div>

        {/* Évolution du score ou statistiques */}
        <div className="order-3 md:col-span-2 lg:col-span-1">
          {hasMultiYearData ? (
            <div className="flex flex-col gap-3 sm:gap-4">
              <ScoreEvolutionChart scoresParAnnee={scoresParAnnee} />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleRecalculate}
                  disabled={isPending}
                  className="flex-1 sm:flex-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recalcul en cours...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recalculer le score
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Export...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Exporter PDF
                    </>
                  )}
                </Button>
                {extractionData && <RatioDebug donnees={extractionData} />}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              <Card>
                <CardHeader className="px-4 pb-2 sm:px-6">
                  <CardTitle className="font-medium text-muted-foreground text-sm">
                    Répartition des ratios
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{statistiques.ratiosVerts}</span>
                      <span className="text-muted-foreground text-xs">verts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{statistiques.ratiosJaunes}</span>
                      <span className="text-muted-foreground text-xs">jaunes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{statistiques.ratiosRouges}</span>
                      <span className="text-muted-foreground text-xs">rouges</span>
                    </div>
                  </div>
                  <p className="mt-2 text-muted-foreground text-xs">
                    Complétude des données : {statistiques.tauxCompletude}%
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleRecalculate}
                  disabled={isPending}
                  className="flex-1 sm:flex-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recalcul en cours...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recalculer le score
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Export...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Exporter PDF
                    </>
                  )}
                </Button>
                {extractionData && <RatioDebug donnees={extractionData} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grille des familles */}
      <div>
        <h2 className="mb-3 font-semibold text-base sm:mb-4 sm:text-lg">Détail par famille</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {FAMILY_ORDER.map((familyId) => {
            const familyScore = score.scoreParFamille[familyId]
            if (!familyScore) return null
            return (
              <ScoreFamille
                key={familyId}
                familyScore={familyScore}
                scoresParAnnee={scoresParAnnee}
                excludedRatios={score.excludedRatios}
              />
            )
          })}
        </div>
      </div>

      {/* Avertissement si complétude faible */}
      {statistiques.tauxCompletude < 70 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:gap-3 sm:p-4 dark:border-amber-800 dark:bg-amber-950">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h4 className="font-medium text-amber-800 text-sm sm:text-base dark:text-amber-200">
              Données incomplètes
            </h4>
            <p className="mt-1 text-amber-700 text-xs sm:text-sm dark:text-amber-300">
              Seulement {statistiques.tauxCompletude}% des ratios ont pu être calculés. Le score
              peut être moins fiable.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
