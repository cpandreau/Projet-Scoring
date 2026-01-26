import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EnterpriseDetail } from '@/components/enterprise/enterprise-detail'
import { getEnterpriseById } from '@/repositories/enterprise.repository'
import { getDossierINPIData } from '@/repositories/inpi.repository'

interface InformationsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: InformationsPageProps): Promise<Metadata> {
  const { id } = await params
  const enterprise = await getEnterpriseById(id)

  if (!enterprise) {
    return { title: 'Entreprise introuvable' }
  }

  return {
    title: enterprise.raison_sociale || 'Entreprise',
    description: `Informations et analyse financière de ${enterprise.raison_sociale || 'entreprise'} (SIREN: ${enterprise.siren})`,
  }
}

export default async function InformationsPage({ params }: InformationsPageProps) {
  const { id } = await params

  const [enterprise, inpiData] = await Promise.all([getEnterpriseById(id), getDossierINPIData(id)])

  if (!enterprise) notFound()

  return (
    <EnterpriseDetail
      enterprise={enterprise}
      dirigeants={inpiData.dirigeants}
      activites={inpiData.activites}
      observations={inpiData.observations}
      historique={inpiData.historique}
    />
  )
}
