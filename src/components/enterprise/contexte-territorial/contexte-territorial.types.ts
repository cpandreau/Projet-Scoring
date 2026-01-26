import type { EnterpriseScoreResult } from '@/actions/score.actions'

export interface ContexteTerritorialProps {
  siren: string
  codeNAF: string
  codeDepartement: string
  scoreResult: EnterpriseScoreResult
}

export interface ChartDataItem {
  annee: string
  creations: number
}
