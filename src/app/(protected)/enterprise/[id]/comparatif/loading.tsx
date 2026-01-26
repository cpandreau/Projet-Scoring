import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const COMPARISON_CATEGORIES = ['Liquidité', 'Rentabilité', 'Solvabilité', 'Activité']

export default function ComparatifLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Card>
        <CardHeader>
          {/* Titre STATIQUE */}
          <CardTitle>Comparatif sectoriel</CardTitle>
          <CardDescription>Positionnement par rapport au secteur d'activité</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Titres des catégories STATIQUES */}
        {COMPARISON_CATEGORIES.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
