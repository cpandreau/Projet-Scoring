import type { INPIBilanSummary, INPICompanyInfoStructured } from '@/actions/inpi'
import type { INPIBilanSaisi } from '@/lib/api/inpi-service'

export interface INPIImportButtonProps {
  siren: string
  dossierId: string
  inpiSyncAt?: string | null
}

export type BilansState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'loaded'; bilans: INPIBilanSummary[] }
  | { type: 'detail-loading'; bilanId: string }
  | { type: 'detail'; bilan: INPIBilanSaisi }
  | { type: 'error'; message: string }

export type CompanyState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'loaded'; data: INPICompanyInfoStructured }
  | { type: 'error'; message: string }
