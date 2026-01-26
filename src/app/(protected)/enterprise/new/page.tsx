import Link from 'next/link'
import { EnterpriseForm } from '@/components/enterprise'

export default function NewEnterprisePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/enterprise" className="text-muted-foreground text-sm hover:text-foreground">
          ← Retour aux dossiers
        </Link>
      </div>

      <EnterpriseForm />
    </div>
  )
}
