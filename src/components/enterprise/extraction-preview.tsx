'use client'

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { EXTRACTION_SECTIONS } from '@/config/fields-labels.config'
import { useExtraction } from '@/hooks'
import type { ExtractionData, ValueWithSource } from '@/schemas/extraction.schema'
import { ExtractionEdit } from './extraction-edit'

interface ExtractionPreviewProps {
  extractionId?: string
  enterpriseId?: string
  documentId?: string
  data: ExtractionData
  isValidated?: boolean
  defaultOpen?: boolean
  onDataUpdated?: () => void
}

// Vérifie si toutes les valeurs extraites sont null
function areAllValuesNull(data: ExtractionData): boolean {
  return Object.values(data).every((field) => (field as ValueWithSource).valeur === null)
}

// Formate un nombre en euros avec séparateur de milliers
function formatCurrency(value: number | null): string {
  if (value === null) {
    return 'Non trouvé'
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ExtractionPreview({
  extractionId,
  enterpriseId,
  documentId,
  data,
  isValidated = false,
  defaultOpen = false,
  onDataUpdated,
}: ExtractionPreviewProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState(data)
  const [localValidated, setLocalValidated] = useState(isValidated)
  const { extracting, extract } = useExtraction()

  const canEdit = extractionId && enterpriseId
  const canReExtract = !!documentId
  const allNull = areAllValuesNull(localData)

  const handleReExtract = async () => {
    if (!documentId) return
    const result = await extract(documentId)
    if (result.success && result.data) {
      setLocalData(result.data)
      setLocalValidated(false) // Réinitialise le statut de validation
      onDataUpdated?.()
    }
  }

  const handleSaved = () => {
    onDataUpdated?.()
  }

  const handleValidated = () => {
    setLocalValidated(true)
    setIsEditing(false)
    onDataUpdated?.()
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <div className="flex items-center gap-2">
            <span>Données extraites</span>
            {localValidated && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Validé
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {isEditing && canEdit ? (
          <ExtractionEdit
            extractionId={extractionId}
            enterpriseId={enterpriseId}
            data={localData}
            isValidated={localValidated}
            onCancel={handleCancelEdit}
            onSaved={handleSaved}
            onValidated={handleValidated}
          />
        ) : (
          <div className="space-y-4 text-sm">
            {allNull && (
              <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-amber-600 text-sm dark:bg-amber-950">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  Aucune donnée n&apos;a pu être extraite. Vérifiez que le document est une liasse
                  fiscale lisible.
                </span>
              </div>
            )}

            {canEdit && (
              <div className="flex justify-end gap-2">
                {canReExtract && !localValidated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReExtract}
                    disabled={extracting}
                    className="text-xs"
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Extraction...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Relancer l&apos;extraction
                      </>
                    )}
                  </Button>
                )}
                {canReExtract && localValidated && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={extracting} className="text-xs">
                        {extracting ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Extraction...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Relancer l&apos;extraction
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Relancer l&apos;extraction ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Les données validées seront écrasées par une nouvelle extraction. Cette
                          action ne peut pas être annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReExtract}>Relancer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {!localValidated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-xs"
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Modifier
                  </Button>
                )}
              </div>
            )}

            {EXTRACTION_SECTIONS.map((section) => (
              <div key={section.id} className="space-y-2">
                {/* Séparateur visuel avec titre de section */}
                <div className="flex items-center gap-3 pt-2">
                  <h4 className="whitespace-nowrap font-semibold text-foreground text-xs">
                    {section.title}
                  </h4>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="divide-y rounded-md border">
                  {section.fields.map((fieldConfig) => {
                    const fieldData = localData[fieldConfig.key] as ValueWithSource
                    const value = fieldData?.valeur
                    const caseSource = fieldData?.case_source
                    const isNull = value === null
                    return (
                      <div
                        key={fieldConfig.key}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <span className="text-muted-foreground">{fieldConfig.label}</span>
                        <div className="text-right">
                          <span
                            className={
                              isNull
                                ? 'text-muted-foreground/50 italic'
                                : 'font-medium tabular-nums'
                            }
                          >
                            {formatCurrency(value)}
                          </span>
                          {!isNull && caseSource && (
                            <span className="ml-2 text-muted-foreground text-xs">
                              — ({caseSource})
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {canEdit && !localValidated && (
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-xs"
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Modifier et valider
                </Button>
              </div>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
