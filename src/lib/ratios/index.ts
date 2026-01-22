// Calcul des ratios
export {
  calculateRatios,
  calculateIntermediates,
  getIntermediates,
  countCalculableRatios,
  type CalculatedRatios,
  type IntermediateAggregates,
} from "./calculate";

// Zonage des ratios
export {
  getZone,
  getZones,
  getRatioWithZone,
  countByZone,
  type Zone,
  type QuartileData,
  type QuartilesMap,
} from "./zone";

// Calcul du score
export {
  calculateScore,
  interpretScore,
  generateScoreSummary,
  getWeakPoints,
  getStrongPoints,
  type RatioDetail,
  type FamilyScore,
  type ScoreResult,
} from "./score";

// Pertinence des ratios
export {
  isRatioRelevant,
  filterRelevantRatioKeys,
  shouldIncludeRatio,
  type RelevanceCheck,
  type ExcludedRatio,
  type RelevanceFilterResult,
} from "./relevance";
