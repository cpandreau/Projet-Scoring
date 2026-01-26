import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EnterpriseNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 font-bold text-2xl">Entreprise introuvable</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Cette entreprise n'existe pas, a été archivée, ou vous n'avez pas les droits pour y
          accéder.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/enterprise">Voir toutes les entreprises</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/enterprise/new">Créer un nouveau dossier</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
