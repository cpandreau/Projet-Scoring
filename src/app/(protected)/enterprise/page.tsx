import { Archive } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { getArchivedCount } from '@/actions/enterprise.actions'
import { EnterpriseListToolbar } from '@/components/enterprise/enterprise-list-toolbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/server'
import {
  type CreatorFilter,
  getCreatorEmails,
  getEnterprisesPaginated,
} from '@/repositories/enterprise.repository'
import { EnterpriseListContent } from './enterprise-list-content'

interface EnterprisePageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    score?: string
    creator?: string
    sort?: string
    page?: string
  }>
}

function EnterpriseListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function EnterprisePage({ searchParams }: EnterprisePageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Parse creator filter
  const creatorFilter: CreatorFilter = params.creator || 'all'

  // Build filters object
  const filters = {
    search: params.search,
    status: params.status,
    scoreZone: params.score,
    creatorFilter,
    sort: params.sort || 'created_desc',
    page: params.page ? parseInt(params.page, 10) : 1,
    perPage: 15,
  }

  const [{ data: enterprises, pagination }, creatorEmails, archivedCount] = await Promise.all([
    getEnterprisesPaginated(user.id, filters),
    getCreatorEmails(),
    getArchivedCount(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Entreprises</h1>
        <Button asChild>
          <Link href="/enterprise/new">Nouveau dossier</Link>
        </Button>
      </div>

      <EnterpriseListToolbar creatorEmails={creatorEmails} currentUserEmail={user.email || ''} />

      <Suspense fallback={<EnterpriseListSkeleton />}>
        <EnterpriseListContent enterprises={enterprises} currentUserEmail={user.email || ''} />
      </Suspense>

      <DataTablePagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.perPage}
      />

      {/* Link to archives */}
      {archivedCount > 0 && (
        <div className="border-t pt-4">
          <Link
            href="/enterprise/archives"
            className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <Archive className="h-4 w-4" />
            <span>Dossiers archivés</span>
            <Badge variant="secondary" className="ml-1">
              {archivedCount}
            </Badge>
          </Link>
        </div>
      )}
    </div>
  )
}
