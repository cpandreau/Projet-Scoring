import { redirect } from 'next/navigation'

interface EnterprisePageProps {
  params: Promise<{ id: string }>
}

export default async function EnterprisePage({ params }: EnterprisePageProps) {
  const { id } = await params
  redirect(`/enterprise/${id}/informations`)
}
