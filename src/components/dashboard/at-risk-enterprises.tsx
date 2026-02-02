import { AlertTriangle, ArrowRight, CheckCircle, TrendingDown } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
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
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-score-warning/10">
              <AlertTriangle className="h-4 w-4 text-score-warning" />
            </div>
            <h3 className="font-semibold text-foreground">Entreprises à surveiller</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Dossiers avec un score inférieur à 5/10
          </p>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-score-excellent/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-score-excellent" />
          </div>
          <p className="font-medium text-foreground">Aucune entreprise à risque</p>
          <p className="text-sm text-muted-foreground mt-1">
            Toutes vos entreprises sont en bonne santé
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-score-critical/5 border border-score-critical/20 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-score-critical/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-score-critical/10">
            <AlertTriangle className="h-4 w-4 text-score-critical" />
          </div>
          <h3 className="font-semibold text-foreground">Entreprises à surveiller</h3>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-score-critical/10 text-score-critical">
            {enterprises.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Dossiers avec un score inférieur à 5/10
        </p>
      </div>
      <div className="p-3 space-y-2">
        {enterprises.slice(0, 5).map((enterprise) => (
          <Link
            key={enterprise.id}
            href={`/enterprise/${enterprise.id}/score`}
            className={cn(
              'flex items-center justify-between rounded-lg p-3',
              'bg-card border border-border',
              'transition-all duration-200',
              'hover:border-brand/30 hover:shadow-sm'
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">
                {enterprise.raison_sociale || 'Sans nom'}
              </p>
              <p className="text-xs text-muted-foreground">
                SIREN: {enterprise.siren || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-sm font-bold font-mono',
                  enterprise.score < 3
                    ? 'bg-score-critical/10 text-score-critical'
                    : 'bg-score-warning/10 text-score-warning'
                )}
              >
                {enterprise.score.toFixed(1)}
              </span>
              {enterprise.previousScore !== null &&
                enterprise.previousScore !== undefined &&
                enterprise.score < enterprise.previousScore && (
                  <TrendingDown className="h-4 w-4 text-score-critical" />
                )}
            </div>
          </Link>
        ))}

        {enterprises.length > 5 && (
          <Button
            variant="ghost"
            className="w-full mt-2 text-score-critical hover:text-score-critical hover:bg-score-critical/10"
            asChild
          >
            <Link href="/enterprise?risk=high">
              Voir les {enterprises.length} entreprises à risque
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
