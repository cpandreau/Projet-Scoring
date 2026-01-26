import { AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AtRiskEnterprise {
  id: string
  raison_sociale: string | null
  siren: string | null
  score: number
  previousScore?: number | null
}

interface AtRiskEnterprisesProps {
  enterprises: AtRiskEnterprise[]
}

export function AtRiskEnterprises({ enterprises }: AtRiskEnterprisesProps) {
  if (enterprises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Entreprises à surveiller
          </CardTitle>
          <CardDescription>Dossiers avec un score inférieur à 5/10</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Aucune entreprise à risque détectée</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200 bg-red-50/30 dark:border-red-900 dark:bg-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Entreprises à surveiller
          <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 text-xs dark:bg-red-900 dark:text-red-300">
            {enterprises.length}
          </span>
        </CardTitle>
        <CardDescription>Dossiers avec un score inférieur à 5/10</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {enterprises.slice(0, 5).map((enterprise) => (
          <Link
            key={enterprise.id}
            href={`/enterprise/${enterprise.id}/score`}
            className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-red-950/50 dark:hover:bg-red-900/50"
          >
            <div>
              <p className="font-medium">{enterprise.raison_sociale || 'Sans nom'}</p>
              <p className="text-muted-foreground text-xs">SIREN: {enterprise.siren || 'N/A'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-bold text-lg',
                  enterprise.score < 3 ? 'text-red-600' : 'text-orange-500'
                )}
              >
                {enterprise.score.toFixed(1)}
              </span>
              {enterprise.previousScore !== null &&
                enterprise.previousScore !== undefined &&
                enterprise.score < enterprise.previousScore && (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
            </div>
          </Link>
        ))}

        {enterprises.length > 5 && (
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/enterprise?risk=high">
              Voir les {enterprises.length} entreprises à risque
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
