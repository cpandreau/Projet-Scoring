import { Banknote, Briefcase, Building2, MapPin, Settings2, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Composant de section skeleton réutilisable
function SectionSkeleton({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// Ligne de données avec label statique et valeur skeleton
function DataRowSkeleton({ label, width = 'w-32' }: { label: string; width?: string }) {
  return (
    <div>
      <dt className="font-medium text-muted-foreground text-sm">{label}</dt>
      <Skeleton className={`mt-0.5 h-5 ${width}`} />
    </div>
  )
}

export default function InformationsLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      {/* 1. Identité */}
      <SectionSkeleton title="Identité" icon={Building2}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DataRowSkeleton label="Dénomination" width="w-48" />
          <DataRowSkeleton label="SIREN" width="w-28" />
          <DataRowSkeleton label="SIRET" width="w-36" />
          <DataRowSkeleton label="Forme juridique" width="w-32" />
          <DataRowSkeleton label="Date d'immatriculation" width="w-32" />
          <DataRowSkeleton label="Début d'activité" width="w-32" />
        </dl>
      </SectionSkeleton>

      {/* 2. Capital & Gouvernance */}
      <SectionSkeleton title="Capital & Gouvernance" icon={Banknote}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DataRowSkeleton label="Capital social" width="w-28" />
          <DataRowSkeleton label="Capital variable" width="w-16" />
          <DataRowSkeleton label="Devise" width="w-12" />
        </dl>
      </SectionSkeleton>

      {/* 3. Siège social */}
      <SectionSkeleton title="Siège social" icon={MapPin}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="font-medium text-muted-foreground text-sm">Adresse complète</dt>
            <Skeleton className="mt-0.5 h-5 w-full max-w-md" />
          </div>
          <DataRowSkeleton label="Code postal" width="w-16" />
          <DataRowSkeleton label="Ville" width="w-32" />
          <DataRowSkeleton label="Pays" width="w-20" />
        </dl>
      </SectionSkeleton>

      {/* 4. Dirigeants */}
      <SectionSkeleton title="Dirigeants" icon={Users}>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="flex-1 space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </SectionSkeleton>

      {/* 5. Activités */}
      <SectionSkeleton title="Activités" icon={Briefcase}>
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 font-medium text-muted-foreground text-sm">Objet social</h4>
            <Skeleton className="h-16 w-full" />
          </div>
          <div>
            <h4 className="mb-2 font-medium text-muted-foreground text-sm">Activités déclarées</h4>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2 rounded bg-muted/50 p-2">
                  <Skeleton className="h-5 w-16 shrink-0" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionSkeleton>

      {/* 6. Caractéristiques */}
      <SectionSkeleton title="Caractéristiques" icon={Settings2}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DataRowSkeleton label="Type de personne" width="w-28" />
          <DataRowSkeleton label="Économie Sociale et Solidaire (ESS)" width="w-12" />
          <DataRowSkeleton label="Société à mission" width="w-12" />
          <DataRowSkeleton label="Micro-entreprise" width="w-12" />
          <DataRowSkeleton label="EIRL" width="w-12" />
          <DataRowSkeleton label="Société étrangère" width="w-12" />
        </dl>
      </SectionSkeleton>
    </div>
  )
}
