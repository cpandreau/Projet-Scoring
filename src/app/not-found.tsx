import { FileQuestion } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 font-bold text-4xl">404</h1>
        <h2 className="mt-2 font-semibold text-xl">Page non trouvée</h2>
        <p className="mt-2 text-muted-foreground">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/enterprise">Voir les entreprises</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
