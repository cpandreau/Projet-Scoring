import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { EnterpriseHeaderAsync } from '@/components/enterprise/enterprise-header-async'
import { EnterpriseHeaderSkeleton } from '@/components/enterprise/enterprise-header-skeleton'
import { EnterpriseNav } from '@/components/enterprise/enterprise-nav'
import { createClient } from '@/lib/supabase/server'

interface EnterpriseLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function EnterpriseLayout({ children, params }: EnterpriseLayoutProps) {
  const { id } = await params

  // Vérification auth uniquement (pas de fetch entreprise)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      {/* Header avec Suspense - skeleton pendant le chargement */}
      <Suspense fallback={<EnterpriseHeaderSkeleton />}>
        <EnterpriseHeaderAsync id={id} />
      </Suspense>

      {/* Navigation STATIQUE - rendu immédiat */}
      <EnterpriseNav enterpriseId={id} />

      {/* Contenu de la page active */}
      <main>{children}</main>
    </div>
  )
}
