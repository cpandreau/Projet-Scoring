import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ArchivesList } from '@/components/enterprise/archives-list'
import { ArchivesListToolbar } from '@/components/enterprise/archives-list-toolbar'
import { Button } from '@/components/ui/button'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { createClient } from '@/lib/supabase/server'
import { getArchivesPaginated } from '@/repositories/enterprise.repository'

interface ArchivesPageProps {
  searchParams: Promise<{
    search?: string
    sort?: string
    page?: string
  }>
}

export default async function ArchivesPage({ searchParams }: ArchivesPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const filters = {
    search: params.search,
    sort: params.sort || 'deleted_desc',
    page: params.page ? parseInt(params.page, 10) : 1,
    perPage: 15,
  }

  const { data: archives, pagination } = await getArchivesPaginated(user.id, filters)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/enterprise">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour à la liste</span>
            </Link>
          </Button>
          <h1 className="font-bold text-2xl">Dossiers archivés</h1>
        </div>
      </div>

      <ArchivesListToolbar />

      <ArchivesList archives={archives} />

      <DataTablePagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.perPage}
      />
    </div>
  )
}
