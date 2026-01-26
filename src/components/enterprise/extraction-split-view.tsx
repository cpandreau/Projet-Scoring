'use client'

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Database,
  FileText,
  Loader2,
  Minimize2,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getLiasseTypeLabel } from '@/config/fields-by-liasse.config'
import type { ExtractionData } from '@/schemas/extraction.schema'
import type { TypeLiasse } from '@/types/document'
import { ExtractionEdit } from './extraction-edit'

// Type pour les documents dans le dropdown
export interface NavigableDocument {
  id: string
  nom_fichier: string
  hasExtraction: boolean
  isValidated: boolean
}

// Chargement dynamique du PdfViewer sans SSR (utilise des APIs DOM)
const PdfViewer = dynamic(() => import('./pdf-viewer').then((mod) => mod.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface ExtractionSplitViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentName: string
  documentUrl: string | null
  loadingUrl?: boolean
  extractionId: string
  enterpriseId: string
  data: ExtractionData
  isValidated: boolean
  typeLiasse?: TypeLiasse | null
  onSaved?: () => void
  onValidated?: () => void
  // Navigation props
  currentIndex?: number
  navigableDocuments?: NavigableDocument[]
  onNavigate?: (index: number) => void
}

// Composant PDF Panel réutilisable
function PdfPanel({
  loadingUrl,
  documentUrl,
}: {
  loadingUrl: boolean
  documentUrl: string | null
}) {
  if (loadingUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (documentUrl) {
    return <PdfViewer url={documentUrl} className="h-full" />
  }

  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      Impossible de charger le document
    </div>
  )
}

// Composant interne pour éviter le reset de state à chaque render
function ExtractionSplitViewContent({
  onOpenChange,
  documentName,
  documentUrl,
  loadingUrl = false,
  extractionId,
  enterpriseId,
  data,
  isValidated,
  typeLiasse,
  onSaved,
  onValidated,
  currentIndex,
  navigableDocuments,
  onNavigate,
}: Omit<ExtractionSplitViewProps, 'open'>) {
  const hasNavigation =
    currentIndex !== undefined && navigableDocuments && navigableDocuments.length > 0 && onNavigate
  const totalDocuments = navigableDocuments?.length ?? 0
  const canGoPrev = hasNavigation && currentIndex > 0
  const canGoNext = hasNavigation && currentIndex < totalDocuments - 1
  // État local pour affichage immédiat du badge après validation
  const [hasBeenValidated, setHasBeenValidated] = useState(isValidated)
  const [mobileTab, setMobileTab] = useState<'pdf' | 'data'>('data')

  // Track previous prop value for state adjustment during rendering (React recommended pattern)
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevIsValidated, setPrevIsValidated] = useState(isValidated)
  if (isValidated && !prevIsValidated) {
    setPrevIsValidated(true)
    setHasBeenValidated(true)
  }

  const showValidated = isValidated || hasBeenValidated

  const handleSaved = () => {
    onSaved?.()
  }

  const handleValidated = () => {
    setHasBeenValidated(true)
    onValidated?.()
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Navigation buttons + dropdown */}
          {hasNavigation && navigableDocuments && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate(currentIndex - 1)}
                disabled={!canGoPrev}
                className="h-8 w-8"
                aria-label="Document précédent"
                title="Document précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Document selector dropdown */}
              <Select
                value={currentIndex.toString()}
                onValueChange={(value) => onNavigate(parseInt(value, 10))}
              >
                <SelectTrigger className="h-8 w-[180px] text-xs sm:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {navigableDocuments.map((doc, index) => (
                    <SelectItem key={doc.id} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        {doc.isValidated ? (
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                        ) : doc.hasExtraction ? (
                          <Clock className="h-3 w-3 shrink-0 text-amber-500" />
                        ) : (
                          <Circle className="h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{doc.nom_fichier}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate(currentIndex + 1)}
                disabled={!canGoNext}
                className="h-8 w-8"
                aria-label="Document suivant"
                title="Document suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <h2 className="max-w-[180px] truncate font-medium text-sm sm:max-w-[400px] sm:text-base">
            {documentName}
          </h2>
          {typeLiasse && (
            <Badge variant="outline" className="shrink-0 text-xs">
              {getLiasseTypeLabel(typeLiasse)}
            </Badge>
          )}
          {showValidated && (
            <Badge variant="default" className="shrink-0 bg-green-600 text-xs hover:bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Validé
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8 shrink-0"
          aria-label="Fermer le panneau"
          title="Fermer"
        >
          <Minimize2 className="h-4 w-4" />
          <span className="sr-only">Fermer le panneau</span>
        </Button>
      </div>

      {/* Mobile: Tabs view */}
      <div className="min-h-0 flex-1 md:hidden">
        <Tabs
          value={mobileTab}
          onValueChange={(v) => setMobileTab(v as 'pdf' | 'data')}
          className="flex h-full flex-col"
        >
          <TabsList className="mx-3 mt-2 grid shrink-0 grid-cols-2">
            <TabsTrigger value="pdf" className="text-xs">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              <Database className="mr-1.5 h-3.5 w-3.5" />
              Données
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="mt-2 min-h-0 flex-1 data-[state=inactive]:hidden">
            <div className="h-full bg-muted/20">
              <PdfPanel loadingUrl={loadingUrl} documentUrl={documentUrl} />
            </div>
          </TabsContent>

          <TabsContent
            value="data"
            className="mt-2 min-h-0 flex-1 overflow-y-auto data-[state=inactive]:hidden"
          >
            <div className="p-3">
              <ExtractionEdit
                extractionId={extractionId}
                enterpriseId={enterpriseId}
                data={data}
                isValidated={showValidated}
                typeLiasse={typeLiasse}
                onCancel={handleClose}
                onSaved={handleSaved}
                onValidated={handleValidated}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Split view */}
      <div className="hidden min-h-0 flex-1 flex-row md:flex">
        {/* PDF Panel - Left */}
        <div className="min-h-0 flex-1 overflow-hidden border-r bg-muted/20">
          <PdfPanel loadingUrl={loadingUrl} documentUrl={documentUrl} />
        </div>

        {/* Extraction Panel - Right */}
        <div className="flex min-h-0 w-[500px] shrink-0 flex-col xl:w-[550px]">
          <div className="shrink-0 border-b bg-background px-4 py-3">
            <h3 className="font-medium">Données extraites</h3>
            <p className="text-muted-foreground text-xs">
              Vérifiez et validez les données extraites du document
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ExtractionEdit
              extractionId={extractionId}
              enterpriseId={enterpriseId}
              data={data}
              isValidated={showValidated}
              typeLiasse={typeLiasse}
              onCancel={handleClose}
              onSaved={handleSaved}
              onValidated={handleValidated}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExtractionSplitView({
  open,
  extractionId,
  isValidated,
  currentIndex,
  navigableDocuments,
  onNavigate,
  ...props
}: ExtractionSplitViewProps) {
  if (!open) return null

  // Utilise key pour reset le state local quand l'extraction ou le statut de validation change
  return (
    <ExtractionSplitViewContent
      key={`${extractionId}-${isValidated}`}
      extractionId={extractionId}
      isValidated={isValidated}
      currentIndex={currentIndex}
      navigableDocuments={navigableDocuments}
      onNavigate={onNavigate}
      {...props}
    />
  )
}
