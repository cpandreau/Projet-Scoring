import { notFound } from 'next/navigation'
import { calculateEnterpriseScore } from '@/actions/score.actions'
import { ContexteTerritorial } from '@/components/enterprise/contexte-territorial'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getEnterpriseById } from '@/repositories/enterprise.repository'

interface ContextePageProps {
  params: Promise<{ id: string }>
}

export default async function ContextePage({ params }: ContextePageProps) {
  const { id } = await params

  const [enterprise, scoreResult] = await Promise.all([
    getEnterpriseById(id),
    calculateEnterpriseScore(id, { saveToHistory: false }),
  ])

  if (!enterprise) notFound()

  if (!enterprise.siren || !enterprise.code_naf) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Données manquantes</CardTitle>
          <CardDescription>
            Le SIREN et le code NAF sont nécessaires pour afficher le contexte territorial.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <ContexteTerritorial
      siren={enterprise.siren}
      codeNAF={enterprise.code_naf}
      codeDepartement={enterprise.code_postal?.substring(0, 2) ?? '75'}
      scoreResult={scoreResult}
    />
  )
}
