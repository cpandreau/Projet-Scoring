import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  getProcedureLabel,
  getProcedureSeverityColor,
  type ProcedureCollectiveResult,
} from '@/lib/utils/procedure-collective-detector'

interface ProcedureAlertProps {
  procedureResult: ProcedureCollectiveResult
}

/**
 * Alerte affichée quand une procédure collective est détectée
 */
export function ProcedureAlert({ procedureResult }: ProcedureAlertProps) {
  if (!procedureResult.hasProcedure) return null

  const colors = getProcedureSeverityColor(procedureResult.severityLevel)

  return (
    <Alert className={`mt-2 ${colors.bg} ${colors.border} border`}>
      <AlertTriangle className={`h-4 w-4 ${colors.text}`} />
      <AlertTitle className={colors.text}>
        {procedureResult.type ? getProcedureLabel(procedureResult.type) : 'Procédure collective'}
      </AlertTitle>
      <AlertDescription className={colors.text}>
        {procedureResult.date && (
          <span className="block text-sm">
            Date : {new Date(procedureResult.date).toLocaleDateString('fr-FR')}
          </span>
        )}
        {procedureResult.allProcedures.length > 1 && (
          <span className="mt-1 block text-sm">
            {procedureResult.allProcedures.length} procédures détectées
          </span>
        )}
      </AlertDescription>
    </Alert>
  )
}
