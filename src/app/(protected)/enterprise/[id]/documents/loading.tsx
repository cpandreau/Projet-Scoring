import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DocumentsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-live="polite">
      {/* DocumentList - structure identique au composant */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Liasses fiscales et documents comptables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Liste - skeleton uniquement pour les données */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Zone upload + INPI button - structure identique à la page */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un document</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="flex items-start sm:w-auto">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  )
}
