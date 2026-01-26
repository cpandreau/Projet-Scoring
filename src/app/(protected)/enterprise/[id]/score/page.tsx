import { FileWarning } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { calculateEnterpriseScore } from '@/actions/score.actions'
import { ScoreDashboard, ScoreHistory } from '@/components/score'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getEnterpriseById } from '@/repositories/enterprise.repository'
import { getExtractionsByEnterprise } from '@/repositories/extraction.repository'
import { getScoreHistory } from '@/repositories/score-history.repository'
import { extractValues } from '@/schemas/extraction.schema'

interface ScorePageProps {
  params: Promise<{ id: string }>
}

export default async function ScorePage({ params }: ScorePageProps) {
  const { id } = await params

  const [enterprise, scoreResult, scoreHistory, extractions] = await Promise.all([
    getEnterpriseById(id),
    calculateEnterpriseScore(id),
    getScoreHistory(id),
    getExtractionsByEnterprise(id),
  ])

  if (!enterprise) notFound()

  // Erreur
  if (!scoreResult.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{scoreResult.error}</p>
        </CardContent>
      </Card>
    )
  }

  // Pas de données validées
  if (!scoreResult.hasValidatedData || !scoreResult.score) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <FileWarning className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle>Aucune donnée validée</CardTitle>
          <CardDescription>
            Pour calculer le score de défaillance, vous devez d&apos;abord extraire et valider les
            données financières d&apos;une liasse fiscale.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Étapes à suivre :</p>
            <ol className="mx-auto max-w-md space-y-2 text-left text-sm">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  1
                </span>
                <span>Uploadez une liasse fiscale (CERFA 2050-2059)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  2
                </span>
                <span>Configurez le type de document comme &quot;Liasse fiscale&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  3
                </span>
                <span>Lancez l&apos;extraction des données</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  4
                </span>
                <span>Vérifiez et validez les données extraites</span>
              </li>
            </ol>
            <Button asChild className="mt-4">
              <Link href={`/enterprise/${id}/documents`}>Gérer les documents</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Récupère les données d'extraction validées les plus récentes pour le debug
  const validatedExtractions = Array.from(extractions.values()).filter((ext) => ext.is_validated)
  const latestValidatedExtraction =
    validatedExtractions.length > 0 ? extractValues(validatedExtractions[0].donnees) : undefined

  // Score disponible
  return (
    <div className="space-y-8">
      <ScoreDashboard
        enterpriseId={id}
        score={scoreResult.score}
        scoresParAnnee={scoreResult.scoresParAnnee}
        extractionData={latestValidatedExtraction}
      />
      <ScoreHistory enterpriseId={id} history={scoreHistory} />
    </div>
  )
}
