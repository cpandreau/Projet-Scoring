"use client";

import { useState, useMemo } from "react";
import { useUpdateExtraction, useValidateExtraction } from "@/hooks";
import type { ExtractionData, ValueWithSource } from "@/schemas/extraction.schema";
import type { TypeLiasse } from "@/types/document";
import { EXTRACTION_SECTIONS } from "@/config/fields-labels.config";
import { getFieldsForLiasse, type FieldConfig } from "@/config/fields-by-liasse.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, CheckCircle, X, Lock, Info, MinusCircle } from "lucide-react";

// Champs qui n'existent pas (ou ne sont pas isolables) en liasse simplifiée
const FIELDS_NOT_IN_SIMPLIFIED = [
  "decouvert_bancaire",     // Inclus dans emprunts case 156
  "reprises_provisions",    // Pas de case dédiée en simplifié
];

interface ExtractionEditProps {
  extractionId: string;
  enterpriseId: string;
  data: ExtractionData;
  isValidated: boolean;
  typeLiasse?: TypeLiasse | null;
  onCancel: () => void;
  onSaved?: () => void;
  onValidated?: () => void;
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
  const [formData, setFormData] = useState<ExtractionData>(data);

  // Créer un mapping des cases CERFA attendues selon le type de liasse
  const expectedCases = useMemo(() => {
    if (!typeLiasse) return new Map<string, string>();

    const config = getFieldsForLiasse(typeLiasse);
    const caseMap = new Map<string, string>();

    // Parcourir toutes les sections et champs pour construire le mapping
    Object.values(config).forEach((section) => {
      section.fields.forEach((field: FieldConfig) => {
        caseMap.set(field.key, field.case);
      });
    });

    return caseMap;
  }, [typeLiasse]);
  const { updating, error: updateError, update } = useUpdateExtraction(enterpriseId);
  const { validating, error: validateError, validate } = useValidateExtraction(enterpriseId);

  const error = updateError || validateError;

  const handleChange = (field: keyof ExtractionData, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: {
        valeur: isNaN(numValue as number) ? null : numValue,
        case_source: (prev[field] as ValueWithSource).case_source,
      },
    }));
  };

  const handleSave = async () => {
    const result = await update(extractionId, formData);
    if (result.success) {
      onSaved?.();
    }
  };

  const handleValidate = async () => {
    // D'abord sauvegarder les modifications
    const saveResult = await update(extractionId, formData);
    if (!saveResult.success) {
      return;
    }

    // Puis valider
    const validateResult = await validate(extractionId);
    if (validateResult.success) {
      onValidated?.();
    }
  };

  return (
    <div className="space-y-4">
      {isValidated && (
        <div className="flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 rounded-md">
          <Lock className="h-4 w-4 shrink-0" />
          <span>Ces données ont été validées et ne peuvent plus être modifiées.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
          <X className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {EXTRACTION_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-3">
            {/* Séparateur visuel avec titre de section */}
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-sm text-foreground whitespace-nowrap">
                {section.title}
              </h4>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.fields.map((fieldConfig) => {
                const fieldData = formData[fieldConfig.key] as ValueWithSource;
                // Afficher la case attendue selon le type de liasse, ou la case extraite
                const expectedCase = expectedCases.get(fieldConfig.key);
                const caseSource = fieldData?.case_source;
                const displayCase = expectedCase || caseSource;

                // Vérifier si ce champ n'existe pas en liasse simplifiée
                const isNotAvailableInSimplified =
                  typeLiasse === "simplifiee" &&
                  FIELDS_NOT_IN_SIMPLIFIED.includes(fieldConfig.key);

                return (
                  <div key={fieldConfig.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={fieldConfig.key} className="text-xs text-muted-foreground">
                        {fieldConfig.label}
                      </Label>
                      {displayCase && !isNotAvailableInSimplified && (
                        <span className="text-[10px] text-muted-foreground/70 font-mono">
                          ({displayCase})
                        </span>
                      )}
                    </div>
                    {isNotAvailableInSimplified ? (
                      <div className="flex items-center gap-2 h-9 px-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                        <MinusCircle className="h-3.5 w-3.5" />
                        <span>N/A en liasse simplifiée</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          id={fieldConfig.key}
                          type="number"
                          value={fieldData?.valeur ?? ""}
                          onChange={(e) => handleChange(fieldConfig.key, e.target.value)}
                          disabled={isValidated}
                          placeholder="Non trouvé"
                          className="pr-8 h-9 tabular-nums"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          €
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!isValidated && (
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-start gap-2 p-3 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 rounded-md">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Les valeurs non renseignées seront automatiquement converties en 0 lors de la validation.</span>
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
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
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
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Validation...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Valider
              </>
            )}
          </Button>
          </div>
        </div>
      )}

      {isValidated && (
        <div className="flex items-center justify-end pt-4 border-t">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Fermer
          </Button>
        </div>
      )}
    </div>
  );
}
