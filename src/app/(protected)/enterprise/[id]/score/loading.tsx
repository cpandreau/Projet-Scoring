import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const FAMILLE_NAMES = ['Liquidité', 'Rentabilité', 'Solvabilité', 'Activité', 'Évolution']

export default function ScoreLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {/* Score global - titre STATIQUE */}
      <Card>
        <CardHeader>
          <CardTitle>Score de santé financière</CardTitle>
          <CardDescription>Évaluation basée sur 50+ ratios financiers</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Skeleton className="h-32 w-32 rounded-full" />
        </CardContent>
      </Card>

      {/* Ratios par famille - titres STATIQUES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FAMILLE_NAMES.map((name) => (
          <Card key={name}>
            <CardHeader>
              {/* Nom de famille STATIQUE */}
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historique - titre STATIQUE */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
