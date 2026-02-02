import { notFound } from 'next/navigation'
import { getAnnuaireData } from '@/actions/annuaire.actions'
import { getCompanyNames } from '@/actions/company-names.actions'
import { getEnterpriseNews, getSectorTrends } from '@/actions/news.actions'
import { getEnterpriseReputation } from '@/actions/reputation.actions'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VeilleDashboard } from '@/components/veille/veille-dashboard'
import { getEnterpriseById } from '@/repositories/enterprise.repository'

interface VeillePageProps {
  params: Promise<{ id: string }>
}

export default async function VeillePage({ params }: VeillePageProps) {
  const { id } = await params
  const enterprise = await getEnterpriseById(id)

  if (!enterprise) {
    notFound()
  }

  // Vérifier que les données nécessaires sont présentes
  if (!enterprise.raison_sociale) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Données manquantes</CardTitle>
          <CardDescription>
            La raison sociale est nécessaire pour rechercher les actualités de l'entreprise.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Fetch annuaire et noms consolidés (INPI + Annuaire)
  const [annuaireData, companyNames] = await Promise.all([
    getAnnuaireData(enterprise.siren || ''),
    getCompanyNames(enterprise.siren || ''),
  ])

  // Liste complète des noms pour les recherches (INPI prioritaire)
  const allNames = companyNames?.allNames || []

  // Fetch news (avec données Annuaire), trends et réputation en parallèle
  const [newsData, trendsData, reputationData] = await Promise.all([
    getEnterpriseNews({
      companyName: enterprise.raison_sociale,
      nafCode: enterprise.code_naf || '',
      city: enterprise.ville || undefined,
      annuaireData, // Enrichit la recherche avec enseigne, sigle, etc.
    }),
    getSectorTrends(enterprise.code_naf || ''),
    getEnterpriseReputation(
      enterprise.raison_sociale,
      enterprise.ville || undefined,
      enterprise.adresse || undefined,
      annuaireData,
      allNames // Utilise tous les noms (INPI + Annuaire) pour la recherche
    ),
  ])

  return (
    <VeilleDashboard
      enterprise={enterprise}
      newsData={newsData}
      trendsData={trendsData}
      annuaireData={annuaireData}
      reputationData={reputationData}
    />
  )
}
