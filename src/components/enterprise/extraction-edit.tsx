'use client'

import { CheckCircle, Info, Loader2, Lock, MinusCircle, Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type FieldConfig, getFieldsForLiasse } from '@/config/fields-by-liasse.config'
import { EXTRACTION_SECTIONS } from '@/config/fields-labels.config'
import { useUpdateExtraction, useValidateExtraction } from '@/hooks'
import type { ExtractionData, ValueWithSource } from '@/schemas/extraction.schema'
import type { TypeLiasse } from '@/types/document'

// Champs qui n'existent pas (ou ne sont pas isolables) en liasse simplifiée
const FIELDS_NOT_IN_SIMPLIFIED = [
  'decouvert_bancaire', // Inclus dans emprunts case 156
  'reprises_provisions', // Pas de case dédiée en simplifié
]

interface ExtractionEditProps {
  extractionId: string
  enterpriseId: string
  data: ExtractionData
  isValidated: boolean
  typeLiasse?: TypeLiasse | null
  onCancel: () => void
  onSaved?: () => void
  onValidated?: () => void
}

export function ExtractionEdit({
  extractionId,
  enterpriseId,
  data,
  isValidated,
  typeLiasse,
  onCancel,
  onSaved,
  onValidated,
}: ExtractionEditProps) {
  const [formData, setFormData] = useState<ExtractionData>(data)

  // Créer un mapping des cases CERFA attendues selon le type de liasse
  const expectedCases = useMemo(() => {
    if (!typeLiasse) return new Map<string, string>()

    const config = getFieldsForLiasse(typeLiasse)
    const caseMap = new Map<string, string>()

    // Parcourir toutes les sections et champs pour construire le mapping
    Object.values(config).forEach((section) => {
      section.fields.forEach((field: FieldConfig) => {
        caseMap.set(field.key, field.case)
      })
    })

    return caseMap
  }, [typeLiasse])
  const { updating, error: updateError, update } = useUpdateExtraction(enterpriseId)
  const { validating, error: validateError, validate } = useValidateExtraction(enterpriseId)

  const error = updateError || validateError

  const handleChange = (field: keyof ExtractionData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    setFormData((prev) => ({
      ...prev,
      [field]: {
        valeur: Number.isNaN(numValue as number) ? null : numValue,
        case_source: (prev[field] as ValueWithSource).case_source,
      },
    }))
  }

  const handleSave = async () => {
    const result = await update(extractionId, formData)
    if (result.success) {
      onSaved?.()
    }
  }

  const handleValidate = async () => {
    // D'abord sauvegarder les modifications
    const saveResult = await update(extractionId, formData)
    if (!saveResult.success) {
      return
    }

    // Puis valider
    const validateResult = await validate(extractionId)
    if (validateResult.success) {
      onValidated?.()
    }
  }

  return (
    <div className="space-y-4">
      {isValidated && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-amber-600 text-sm dark:bg-amber-950">
          <Lock className="h-4 w-4 shrink-0" />
          <span>Ces données ont été validées et ne peuvent plus être modifiées.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-500 text-sm dark:bg-red-950">
          <X className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {EXTRACTION_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-3">
            {/* Séparateur visuel avec titre de section */}
            <div className="flex items-center gap-3">
              <h4 className="whitespace-nowrap font-semibold text-foreground text-sm">
                {section.title}
              </h4>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.fields.map((fieldConfig) => {
                const fieldData = formData[fieldConfig.key] as ValueWithSource
                // Afficher la case attendue selon le type de liasse, ou la case extraite
                const expectedCase = expectedCases.get(fieldConfig.key)
                const caseSource = fieldData?.case_source
                const displayCase = expectedCase || caseSource

                // Vérifier si ce champ n'existe pas en liasse simplifiée
                const isNotAvailableInSimplified =
                  typeLiasse === 'simplifiee' && FIELDS_NOT_IN_SIMPLIFIED.includes(fieldConfig.key)

                return (
                  <div key={fieldConfig.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={fieldConfig.key} className="text-muted-foreground text-xs">
                        {fieldConfig.label}
                      </Label>
                      {displayCase && !isNotAvailableInSimplified && (
                        <span className="font-mono text-[10px] text-muted-foreground/70">
                          ({displayCase})
                        </span>
                      )}
                    </div>
                    {isNotAvailableInSimplified ? (
                      <div className="flex h-9 items-center gap-2 rounded-md bg-muted/50 px-3 text-muted-foreground text-sm">
                        <MinusCircle className="h-3.5 w-3.5" />
                        <span>N/A en liasse simplifiée</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          id={fieldConfig.key}
                          type="number"
                          value={fieldData?.valeur ?? ''}
                          onChange={(e) => handleChange(fieldConfig.key, e.target.value)}
                          disabled={isValidated}
                          placeholder="Non trouvé"
                          className="h-9 pr-8 tabular-nums"
                        />
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-xs">
                          €
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!isValidated && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-blue-600 text-sm dark:bg-blue-950 dark:text-blue-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Les valeurs non renseignées seront automatiquement converties en 0 lors de la
              validation.
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={updating || validating}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={updating || validating}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleValidate}
              disabled={updating || validating}
            >
              {validating ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Valider
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {isValidated && (
        <div className="flex items-center justify-end border-t pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Fermer
          </Button>
        </div>
      )}
    </div>
  )
}
