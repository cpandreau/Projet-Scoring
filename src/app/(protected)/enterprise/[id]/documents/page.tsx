import { notFound } from 'next/navigation'
import { DocumentList } from '@/components/enterprise/document-list'
import { DocumentUpload } from '@/components/enterprise/document-upload'
import { INPIImportButton } from '@/components/inpi/inpi-import-button'
import { getDocumentsByEnterprise } from '@/repositories/document.repository'
import { getEnterpriseById } from '@/repositories/enterprise.repository'
import { getExtractionsByEnterprise } from '@/repositories/extraction.repository'

interface DocumentsPageProps {
  params: Promise<{ id: string }>
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { id } = await params

  const [enterprise, documents, extractions] = await Promise.all([
    getEnterpriseById(id),
    getDocumentsByEnterprise(id),
    getExtractionsByEnterprise(id),
  ])

  if (!enterprise) notFound()

  return (
    <div className="space-y-4 sm:space-y-6">
      <DocumentList enterpriseId={enterprise.id} documents={documents} extractions={extractions} />
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <DocumentUpload enterpriseId={enterprise.id} />
        </div>
        {enterprise.siren && (
          <div className="flex items-start sm:w-auto">
            <INPIImportButton
              siren={enterprise.siren}
              dossierId={enterprise.id}
              inpiSyncAt={enterprise.inpi_sync_at}
            />
          </div>
        )}
      </div>
    </div>
  )
}
