import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function ArchivesLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      {/* Header - STATIQUE (identique à page.tsx) */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">Dossiers archivés</h1>
      </div>

      {/* Table - Headers STATIQUES, contenu skeleton */}
      <section>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Headers STATIQUES - identiques à archives-list.tsx */}
                <TableHead>Denomination</TableHead>
                <TableHead>SIREN</TableHead>
                <TableHead>Archive le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 5 lignes skeleton */}
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
