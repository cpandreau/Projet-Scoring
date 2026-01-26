import {
  Activity,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Lightbulb,
  MapPin,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// StatCard skeleton avec label statique
function StatCardSkeleton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-muted-foreground text-sm">{label}</p>
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </Card>
  )
}

export default function ContexteLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {/* 1. Header avec sélecteur d'année */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            Contexte territorial
          </h3>
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Année :</span>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* 2. Score de santé financière */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            Score de santé financière
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>

      {/* 3. Score Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Répartition du score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Grid de 4 StatCards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCardSkeleton icon={Building2} label="Entreprises du secteur" />
        <StatCardSkeleton icon={TrendingUp} label="Créations" />
        <StatCardSkeleton icon={Activity} label="Densité" />
        <StatCardSkeleton icon={Activity} label="Santé du secteur" />
      </div>

      {/* 5. Démographie régionale */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Démographie des entreprises
          </CardTitle>
          <CardDescription>Mouvements d&apos;entreprises tous secteurs confondus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950/30">
              <Skeleton className="mx-auto h-8 w-20" />
              <div className="mt-1 text-muted-foreground text-sm">Créations</div>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-950/30">
              <Skeleton className="mx-auto h-8 w-20" />
              <div className="mt-1 text-muted-foreground text-sm">Cessations</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
              <Skeleton className="mx-auto h-8 w-20" />
              <div className="mt-1 text-muted-foreground text-sm">Solde net</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
              <Skeleton className="mx-auto h-8 w-16" />
              <div className="mt-1 text-muted-foreground text-sm">Taux de cessation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Contexte économique local */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            Contexte économique local
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <div className="text-muted-foreground text-sm">Taux de chômage</div>
              <Skeleton className="mt-1 h-7 w-16" />
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Revenu médian</div>
              <Skeleton className="mt-1 h-7 w-24" />
            </div>
            <div>
              <div className="text-muted-foreground text-sm">PIB régional</div>
              <Skeleton className="mt-1 h-7 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. Effectifs du secteur */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            Effectifs du secteur dans le département
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-muted-foreground text-sm">Salariés</div>
              <Skeleton className="mt-1 h-7 w-20" />
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Établissements</div>
              <Skeleton className="mt-1 h-7 w-16" />
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Effectif moyen</div>
              <Skeleton className="mt-1 h-7 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8. Evolution Chart + Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Evolution Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Évolution des créations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-37.5 w-full" />
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
            <ul className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">•</span>
                  <Skeleton className="h-4 w-full" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 9. Détails géographiques */}
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
              <Skeleton className="mt-0.5 h-5 w-28" />
            </div>
            <div>
              <dt className="text-muted-foreground">Département</dt>
              <Skeleton className="mt-0.5 h-5 w-32" />
            </div>
            <div>
              <dt className="text-muted-foreground">Population</dt>
              <Skeleton className="mt-0.5 h-5 w-20" />
            </div>
            <div>
              <dt className="text-muted-foreground">Secteur NAF</dt>
              <Skeleton className="mt-0.5 h-5 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 10. Footer sources */}
      <Skeleton className="h-3 w-80" />
    </div>
  )
}
