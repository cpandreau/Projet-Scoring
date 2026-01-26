// Types
export type {
  FetchINPIBilanDetailResult,
  FetchINPIBilansResult,
  FetchINPICompanyInfoResult,
  INPIActiviteStructuree,
  INPIAdresseStructuree,
  INPIBilanSummary,
  INPICompanyFullData,
  INPICompanyInfoStructured,
  INPIDirigeant,
  INPIEtablissementStructure,
  INPIHistoriqueEvent,
  INPIObservationRCS,
  INPIRegistresStructure,
  SyncINPIResult,
} from './inpi.types'

// Constantes et helpers
export {
  FORMES_JURIDIQUES,
  getFormeJuridiqueLabel,
  getRoleLabel,
  ROLES_ENTREPRISE,
} from './inpi.types'

// Actions - Bilans
export { fetchINPIBilanDetail, fetchINPIBilans } from './inpi-bilans.actions'

// Actions - Company Info
export { fetchINPICompanyInfo } from './inpi-company.actions'

// Actions - Sync
export { syncINPIToDatabase } from './inpi-sync.actions'
