// Calcul des ratios
export {
  type CalculatedRatios,
  calculateIntermediates,
  calculateRatios,
  countCalculableRatios,
  getIntermediates,
  type IntermediateAggregates,
} from './calculate'
// Pertinence des ratios
export {
  type ExcludedRatio,
  filterRelevantRatioKeys,
  isRatioRelevant,
  type RelevanceCheck,
  type RelevanceFilterResult,
  shouldIncludeRatio,
} from './relevance'
// Calcul du score
export {
  calculateScore,
  type FamilyScore,
  generateScoreSummary,
  getStrongPoints,
  getWeakPoints,
  interpretScore,
  type RatioDetail,
  type ScoreResult,
} from './score'
// Zonage des ratios
export {
  countByZone,
  getRatioWithZone,
  getZone,
  getZones,
  type QuartileData,
  type QuartilesMap,
  type Zone,
} from './zone'
