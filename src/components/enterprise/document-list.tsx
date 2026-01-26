'use client'

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  FileX,
  Loader2,
  MoreVertical,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { bulkValidateExtractions } from '@/actions/extraction.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getDocumentStatus,
  getDocumentsSummary,
  useDeleteDocument,
  useDocumentUrl,
  useExtraction,
  useUpdateDocument,
} from '@/hooks'
import { showError, showInfo, showSuccess, showWarning } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { ExtractionData } from '@/schemas/extraction.schema'
import type { Document, DocumentType, TypeLiasse } from '@/types'
import { AVAILABLE_YEARS, DOCUMENT_TYPES, TYPE_LIASSE_OPTIONS } from '@/types/document'
import { ExtractionPreview } from './extraction-preview'
import { ExtractionSplitView, type NavigableDocument } from './extraction-split-view'

interface ExtractedData {
  id: string
  donnees: ExtractionData
  is_validated: boolean
}

interface DocumentListProps {
  enterpriseId: string
  documents: Document[]
  extractions?: Map<string, ExtractedData>
}

// Type pour le document sélectionné dans la split-view
interface SelectedDocument {
  id: string
  name: string
  extractionId: string
  data: ExtractionData
  isValidated: boolean
  typeLiasse: TypeLiasse | null
}

// Badge de statut
function StatusBadge({
  status,
  label,
  color,
}: {
  status: string
  label: string
  color: 'gray' | 'orange' | 'green'
}) {
  const colorClasses = {
    gray: 'bg-muted text-muted-foreground',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  }

  const icons = {
    valide: <FileCheck className="h-3 w-3" />,
    extrait: <Clock className="h-3 w-3" />,
    en_attente: <Sparkles className="h-3 w-3" />,
    non_applicable: <FileX className="h-3 w-3" />,
  }

  return (
    <Badge variant="secondary" className={cn('gap-1 font-medium text-xs', colorClasses[color])}>
      {icons[status as keyof typeof icons]}
      {label}
    </Badge>
  )
}

// Résumé des documents
function DocumentsSummary({
  total,
  valides,
  extraits,
  enAttente,
}: {
  total: number
  valides: number
  extraits: number
  enAttente: number
}) {
  const parts: string[] = []
  if (valides > 0) parts.push(`${valides} validé${valides > 1 ? 's' : ''}`)
  if (extraits > 0) parts.push(`${extraits} extrait${extraits > 1 ? 's' : ''}`)
  if (enAttente > 0) parts.push(`${enAttente} à extraire`)

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <span className="font-medium text-foreground">
        {total} document{total > 1 ? 's' : ''}
      </span>
      {parts.length > 0 && (
        <>
          <span>·</span>
          <span>{parts.join(' · ')}</span>
        </>
      )}
    </div>
  )
}

export function DocumentList({
  enterpriseId,
  documents,
  extractions = new Map(),
}: DocumentListProps) {
  const router = useRouter()
  const {
    updating,
    error: updateError,
    updateYear,
    updateType,
    updateTypeLiasse,
  } = useUpdateDocument(enterpriseId)
  const { deleting, error: deleteError, remove } = useDeleteDocument(enterpriseId)
  const { extracting, error: extractError, extract } = useExtraction()
  const { loading: loadingUrl, url: documentUrl, fetchUrl, clearUrl } = useDocumentUrl()

  const [extractingDocId, setExtractingDocId] = useState<string | null>(null)
  const [splitViewOpen, setSplitViewOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<SelectedDocument | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // État pour l'extraction en série
  const [isExtractingAll, setIsExtractingAll] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 })

  // État pour la validation en masse
  const [isBulkValidating, setIsBulkValidating] = useState(false)

  // État pour le filtre et le tri
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'extracted' | 'validated'>(
    'all'
  )
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  const error = updateError || deleteError || extractError

  // Calcul du résumé - utilise uniquement les données serveur
  const summary = getDocumentsSummary(documents, extractions)

  // Filtrer et trier les documents côté client
  const filteredDocuments = useMemo(() => {
    let result = documents

    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter((doc) => {
        const extraction = extractions.get(doc.id)
        if (statusFilter === 'pending') return !extraction
        if (statusFilter === 'extracted') return extraction && !extraction.is_validated
        if (statusFilter === 'validated') return extraction?.is_validated
        return true
      })
    }

    // Tri par année d'exercice
    result = [...result].sort((a, b) => {
      const yearA = a.annee_exercice ?? 0
      const yearB = b.annee_exercice ?? 0
      return sortOrder === 'desc' ? yearB - yearA : yearA - yearB
    })

    return result
  }, [documents, extractions, statusFilter, sortOrder])

  // Filtrer les documents éligibles à l'extraction
  const getExtractableDocuments = () => {
    return documents.filter(
      (doc) =>
        doc.type === 'liasse_fiscale' &&
        doc.type_liasse && // Type de liasse défini
        !extractions.get(doc.id) // Pas encore extrait
    )
  }

  const extractableCount = getExtractableDocuments().length

  // Fonction d'extraction en série
  const handleExtractAll = async () => {
    const docsToExtract = getExtractableDocuments()
    if (docsToExtract.length === 0) {
      showInfo('Aucun document à extraire')
      return
    }

    setIsExtractingAll(true)
    setExtractionProgress({ current: 0, total: docsToExtract.length })

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < docsToExtract.length; i++) {
      const doc = docsToExtract[i]
      setExtractionProgress({ current: i + 1, total: docsToExtract.length })
      setExtractingDocId(doc.id)

      try {
        const result = await extract(doc.id)
        if (result.success) {
          successCount++
        } else {
          errorCount++
          console.error(`Erreur extraction ${doc.nom_fichier}:`, result.error)
        }
      } catch (error) {
        errorCount++
        console.error(`Erreur extraction ${doc.nom_fichier}:`, error)
      }

      // Petit délai entre chaque extraction pour éviter de surcharger l'API
      if (i < docsToExtract.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    setIsExtractingAll(false)
    setExtractingDocId(null)
    setExtractionProgress({ current: 0, total: 0 })

    // Rafraîchir les données
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.refresh()

    // Toast récapitulatif
    if (errorCount === 0) {
      showSuccess(
        `${successCount} document${successCount > 1 ? 's' : ''} extrait${successCount > 1 ? 's' : ''} avec succès`
      )
    } else {
      showWarning(`${successCount} succès, ${errorCount} erreur${errorCount > 1 ? 's' : ''}`)
    }
  }

  // Fonctions d'accès aux données - source unique : props serveur
  const getDocumentExtraction = (documentId: string) => {
    return extractions.get(documentId) || null
  }

  const getExtractionData = (documentId: string): ExtractionData | null => {
    return getDocumentExtraction(documentId)?.donnees ?? null
  }

  const getExtractionId = (documentId: string): string | undefined => {
    return getDocumentExtraction(documentId)?.id
  }

  const isExtractionValidated = (documentId: string): boolean => {
    return getDocumentExtraction(documentId)?.is_validated ?? false
  }

  const handleExtract = async (documentId: string) => {
    setExtractingDocId(documentId)
    const result = await extract(documentId)
    if (result.success) {
      // Attendre que revalidatePath soit effectif avant de rafraîchir
      await new Promise((resolve) => setTimeout(resolve, 300))
      router.refresh()
    }
    setExtractingDocId(null)
  }

  const handleDataUpdated = () => {
    router.refresh()
  }

  // Liste des documents avec extraction (pour navigation)
  const documentsWithExtraction = useMemo(() => {
    return filteredDocuments.filter((doc) => {
      const extraction = extractions.get(doc.id)
      return extraction && extraction.donnees
    })
  }, [filteredDocuments, extractions])

  // Documents navigables avec leur statut (pour le dropdown dans la split view)
  const navigableDocuments: NavigableDocument[] = useMemo(() => {
    return documentsWithExtraction.map((doc) => {
      const extraction = extractions.get(doc.id)
      return {
        id: doc.id,
        nom_fichier: doc.nom_fichier,
        hasExtraction: !!extraction,
        isValidated: extraction?.is_validated ?? false,
      }
    })
  }, [documentsWithExtraction, extractions])

  // Documents extraits mais non validés (pour bulk validation)
  const pendingValidationDocs = useMemo(() => {
    return documents.filter((doc) => {
      const extraction = extractions.get(doc.id)
      return extraction && !extraction.is_validated
    })
  }, [documents, extractions])

  const openSplitView = async (doc: Document, index?: number) => {
    const extractionId = getExtractionId(doc.id)
    const data = getExtractionData(doc.id)
    const validated = isExtractionValidated(doc.id)

    if (!extractionId || !data) return

    // Trouver l'index dans la liste des documents avec extraction
    const docIndex =
      index !== undefined ? index : documentsWithExtraction.findIndex((d) => d.id === doc.id)

    setSelectedDoc({
      id: doc.id,
      name: doc.nom_fichier,
      extractionId,
      data,
      isValidated: validated,
      typeLiasse: doc.type_liasse,
    })
    setSelectedIndex(docIndex)
    setSplitViewOpen(true)

    // Charger l'URL du document
    await fetchUrl(doc.id)
  }

  const handleNavigate = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= documentsWithExtraction.length) return

    const doc = documentsWithExtraction[newIndex]
    await openSplitView(doc, newIndex)
  }

  // Handler pour la validation en masse
  const handleBulkValidate = async () => {
    if (pendingValidationDocs.length === 0) return

    setIsBulkValidating(true)

    const extractionIds = pendingValidationDocs
      .map((doc) => extractions.get(doc.id)?.id)
      .filter((id): id is string => !!id)

    const result = await bulkValidateExtractions(enterpriseId, extractionIds)

    if (result.success) {
      showSuccess(
        `${result.count ?? pendingValidationDocs.length} document${(result.count ?? pendingValidationDocs.length) > 1 ? 's' : ''} validé${(result.count ?? pendingValidationDocs.length) > 1 ? 's' : ''}`
      )
      router.refresh()
    } else {
      showError(result.error ?? 'Erreur lors de la validation')
    }

    setIsBulkValidating(false)
  }

  const closeSplitView = () => {
    setSplitViewOpen(false)
    setSelectedDoc(null)
    setSelectedIndex(-1)
    clearUrl()
  }

  const handleSplitViewSaved = () => {
    router.refresh()
  }

  const handleSplitViewValidated = () => {
    router.refresh()
    // Mettre à jour le statut local
    if (selectedDoc) {
      setSelectedDoc({ ...selectedDoc, isValidated: true })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (documents.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Documents
            </CardTitle>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              Configurez le type et l&apos;année de chaque document
            </CardDescription>
          </div>

          {/* Bouton Extraire tout */}
          {extractableCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExtractAll}
              disabled={isExtractingAll || extractingDocId !== null}
              className="hidden sm:flex"
            >
              {isExtractingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {extractionProgress.current}/{extractionProgress.total}
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Extraire tout ({extractableCount})
                </>
              )}
            </Button>
          )}
        </div>

        {/* Barre de progression extraction en série */}
        {isExtractingAll && (
          <div className="mt-3 rounded-lg bg-muted p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-sm">Extraction en cours...</span>
              <span className="text-muted-foreground text-sm">
                {extractionProgress.current} / {extractionProgress.total}
              </span>
            </div>
            <Progress
              value={(extractionProgress.current / extractionProgress.total) * 100}
              className="h-2"
            />
          </div>
        )}

        {/* Résumé */}
        <div className="pt-2">
          <DocumentsSummary
            total={summary.total}
            valides={summary.valides}
            extraits={summary.extraits}
            enAttente={summary.enAttente}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 sm:space-y-4 sm:px-6">
        {/* Filtres et tri */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="extracted">Extrait</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as typeof sortOrder)}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Année (récent → ancien)</SelectItem>
              <SelectItem value="asc">Année (ancien → récent)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bannière validation en masse */}
        {pendingValidationDocs.length > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-800 text-sm dark:text-amber-200">
                {pendingValidationDocs.length} document
                {pendingValidationDocs.length > 1 ? 's' : ''} en attente de validation
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleBulkValidate}
              disabled={isBulkValidating}
              className="shrink-0"
            >
              {isBulkValidating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Tout valider
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-red-500 text-sm dark:bg-red-950">
            {error}
          </div>
        )}

        {/* Message si aucun résultat après filtrage */}
        {filteredDocuments.length === 0 && documents.length > 0 && (
          <div className="rounded-lg border bg-muted/50 py-6 text-center">
            <p className="text-muted-foreground text-sm">
              Aucun document ne correspond à ce filtre.
            </p>
          </div>
        )}

        <ul className="space-y-2 sm:space-y-3">
          {filteredDocuments.map((doc) => {
            const extraction = extractions.get(doc.id)
            const statusInfo = getDocumentStatus(doc, extraction)
            const extractionData = getExtractionData(doc.id)
            const isExtracting = extractingDocId === doc.id && extracting

            return (
              <li key={doc.id} className="space-y-2 rounded-lg border p-3 sm:space-y-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="shrink-0 rounded-lg bg-red-100 p-1.5 sm:p-2 dark:bg-red-900">
                    <FileText className="h-4 w-4 text-red-600 sm:h-5 sm:w-5 dark:text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <p
                        className="max-w-[150px] truncate font-medium text-sm sm:max-w-none sm:text-base"
                        title={doc.nom_fichier}
                      >
                        {doc.nom_fichier}
                      </p>
                      <StatusBadge
                        status={statusInfo.status}
                        label={statusInfo.label}
                        color={statusInfo.color}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground sm:text-xs">
                      Uploadé le {formatDate(doc.created_at)}
                    </p>
                  </div>
                  {/* Actions desktop */}
                  <div className="hidden shrink-0 items-center gap-1 sm:flex">
                    {statusInfo.canExtract && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtract(doc.id)}
                        disabled={
                          isExtracting || (doc.type === 'liasse_fiscale' && !doc.type_liasse)
                        }
                        className="text-xs"
                        title={
                          doc.type === 'liasse_fiscale' && !doc.type_liasse
                            ? "Choisir le type de liasse d'abord"
                            : undefined
                        }
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Extraction...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1 h-3 w-3" />
                            Extraire
                          </>
                        )}
                      </Button>
                    )}
                    {statusInfo.canView && getExtractionId(doc.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSplitView(doc)}
                        className="text-xs"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Voir
                      </Button>
                    )}
                    {statusInfo.canReextract && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExtract(doc.id)}
                        disabled={isExtracting}
                        className="text-muted-foreground text-xs"
                        title="Relancer l'extraction"
                      >
                        {isExtracting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(doc.id, doc.nom_fichier)}
                      disabled={deleting === doc.id}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Supprimer le document"
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Supprimer le document</span>
                    </Button>
                  </div>

                  {/* Actions mobile - dropdown menu */}
                  <div className="shrink-0 sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Actions du document"
                        >
                          {isExtracting || deleting === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                          <span className="sr-only">Actions du document</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {statusInfo.canExtract && (
                          <DropdownMenuItem
                            onClick={() => handleExtract(doc.id)}
                            disabled={
                              isExtracting || (doc.type === 'liasse_fiscale' && !doc.type_liasse)
                            }
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {doc.type === 'liasse_fiscale' && !doc.type_liasse
                              ? 'Choisir le type de liasse'
                              : 'Extraire'}
                          </DropdownMenuItem>
                        )}
                        {statusInfo.canView && getExtractionId(doc.id) && (
                          <DropdownMenuItem onClick={() => openSplitView(doc)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les données
                          </DropdownMenuItem>
                        )}
                        {statusInfo.canReextract && (
                          <DropdownMenuItem
                            onClick={() => handleExtract(doc.id)}
                            disabled={isExtracting}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Relancer l&apos;extraction
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => remove(doc.id, doc.nom_fichier)}
                          disabled={deleting === doc.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Type de document</Label>
                    <Select
                      value={doc.type}
                      onValueChange={(value) => updateType(doc.id, value as DocumentType)}
                      disabled={updating === doc.id}
                    >
                      <SelectTrigger className="h-9">
                        {updating === doc.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Année d&apos;exercice</Label>
                    <Select
                      value={doc.annee_exercice?.toString() ?? 'none'}
                      onValueChange={(value) => updateYear(doc.id, value)}
                      disabled={updating === doc.id}
                    >
                      <SelectTrigger className="h-9">
                        {updating === doc.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <SelectValue placeholder="Non définie" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Non définie</SelectItem>
                        {AVAILABLE_YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type de liasse fiscale - affiché uniquement pour les liasses fiscales */}
                  {doc.type === 'liasse_fiscale' && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Type de liasse</Label>
                      <Select
                        value={doc.type_liasse ?? ''}
                        onValueChange={(value) => updateTypeLiasse(doc.id, value as TypeLiasse)}
                        disabled={updating === doc.id || !!extraction}
                      >
                        <SelectTrigger
                          className={cn(
                            'h-9',
                            !doc.type_liasse && 'border-orange-300 dark:border-orange-700'
                          )}
                        >
                          {updating === doc.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <SelectValue placeholder="Choisir..." />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_LIASSE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col">
                                <span>{option.label}</span>
                                <span className="text-muted-foreground text-xs">
                                  {option.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!doc.type_liasse && !extraction && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400">
                          Requis pour l&apos;extraction
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {doc.type !== 'autre' && doc.type !== 'non_classe' && doc.annee_exercice && (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <Check className="h-3 w-3" />
                    <span>Document configuré</span>
                  </div>
                )}

                {/* Aperçu des données extraites */}
                {extractionData && (
                  <div className="border-t pt-2">
                    <ExtractionPreview
                      extractionId={getExtractionId(doc.id)}
                      enterpriseId={enterpriseId}
                      documentId={doc.id}
                      data={extractionData}
                      isValidated={isExtractionValidated(doc.id)}
                      onDataUpdated={handleDataUpdated}
                    />
                  </div>
                )}

                {/* CTA Valider - affiché si extraction existe mais non validée */}
                {extraction && !extraction.is_validated && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="text-amber-700 text-sm dark:text-amber-300">
                        Données extraites — Vérifiez et validez
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => openSplitView(doc)}
                      className="shrink-0 bg-amber-600 text-white hover:bg-amber-700"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Valider
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>

      {/* Split View Dialog */}
      {selectedDoc && (
        <ExtractionSplitView
          open={splitViewOpen}
          onOpenChange={(open) => {
            if (!open) closeSplitView()
          }}
          documentName={selectedDoc.name}
          documentUrl={documentUrl}
          loadingUrl={loadingUrl}
          extractionId={selectedDoc.extractionId}
          enterpriseId={enterpriseId}
          data={selectedDoc.data}
          isValidated={selectedDoc.isValidated}
          typeLiasse={selectedDoc.typeLiasse}
          onSaved={handleSplitViewSaved}
          onValidated={handleSplitViewValidated}
          currentIndex={selectedIndex}
          navigableDocuments={navigableDocuments}
          onNavigate={handleNavigate}
        />
      )}
    </Card>
  )
}
