import { notFound } from 'next/navigation'
import { calculateEnterpriseScore } from '@/actions/score.actions'
import { ComparatifDashboard } from '@/components/comparatif/comparatif-dashboard'
import { getEnterpriseById } from '@/repositories/enterprise.repository'

interface ComparatifPageProps {
  params: Promise<{ id: string }>
}

export default async function ComparatifPage({ params }: ComparatifPageProps) {
  const { id } = await params

  const [enterprise, scoreResult] = await Promise.all([
    getEnterpriseById(id),
    calculateEnterpriseScore(id, { saveToHistory: false }),
  ])

  if (!enterprise) notFound()

  return <ComparatifDashboard enterpriseId={id} scoreResult={scoreResult} />
}
