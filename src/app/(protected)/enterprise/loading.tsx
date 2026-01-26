import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SkeletonCardList } from '@/components/ui/loading-skeleton'

export default function EnterpriseListLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      {/* Header STATIQUE - rendu immédiat */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">Entreprises</h1>
        <Button asChild>
          <Link href="/enterprise/new">Nouveau dossier</Link>
        </Button>
      </div>

      {/* Liste - skeleton uniquement pour les données */}
      <section>
        <SkeletonCardList count={5} />
      </section>
    </div>
  )
}
