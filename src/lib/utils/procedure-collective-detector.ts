/**
 * Détecteur de procédures collectives à partir des observations RCS
 *
 * Les procédures collectives incluent :
 * - Sauvegarde : procédure préventive pour les entreprises en difficulté
 * - Redressement judiciaire : pour les entreprises en cessation des paiements
 * - Liquidation judiciaire : quand le redressement n'est pas possible
 */

export interface RCSObservation {
  date: string
  texte: string
  code: string
  etat?: string
}

export type ProcedureType =
  | 'sauvegarde'
  | 'redressement'
  | 'liquidation'
  | 'cessation_paiements'
  | 'plan_continuation'
  | 'plan_cession'
  | 'autre'

export interface ProcedureCollectiveResult {
  /** Indique si une procédure collective est détectée */
  hasProcedure: boolean
  /** Type de procédure (la plus grave si plusieurs) */
  type: ProcedureType | null
  /** Date de la procédure (la plus récente) */
  date: string | null
  /** Texte de l'observation concernée */
  details: string | null
  /** Toutes les procédures détectées */
  allProcedures: {
    type: ProcedureType
    date: string
    texte: string
    code: string
  }[]
  /** Niveau de gravité (1 = faible, 5 = très grave) */
  severityLevel: number
}

// Configuration des patterns de détection
const PROCEDURE_PATTERNS: {
  type: ProcedureType
  keywords: string[]
  severity: number
}[] = [
  {
    type: 'liquidation',
    keywords: [
      'liquidation judiciaire',
      'liquidation',
      "clôture pour insuffisance d'actif",
      'clôture de la liquidation',
    ],
    severity: 5,
  },
  {
    type: 'redressement',
    keywords: [
      'redressement judiciaire',
      'redressement',
      'ouverture redressement',
      'jugement de redressement',
    ],
    severity: 4,
  },
  {
    type: 'cessation_paiements',
    keywords: ['cessation des paiements', 'cessation de paiement', 'état de cessation'],
    severity: 4,
  },
  {
    type: 'sauvegarde',
    keywords: [
      'procédure de sauvegarde',
      'sauvegarde',
      'ouverture sauvegarde',
      'plan de sauvegarde',
    ],
    severity: 3,
  },
  {
    type: 'plan_cession',
    keywords: ['plan de cession', 'cession totale', 'cession partielle'],
    severity: 4,
  },
  {
    type: 'plan_continuation',
    keywords: ['plan de continuation', 'plan de redressement', 'adoption du plan'],
    severity: 2,
  },
]

// Patterns indiquant une clôture/fin de procédure (moins grave)
const CLOSURE_PATTERNS = [
  'clôture de la procédure',
  "fin de la période d'observation",
  'clôture pour extinction du passif',
  'homologation du plan',
  'résolution du plan',
]

/**
 * Détecte si une observation concerne une procédure collective
 */
function detectProcedureInText(texte: string): {
  type: ProcedureType
  severity: number
} | null {
  const texteLower = texte.toLowerCase()

  // Vérifier d'abord si c'est une clôture positive
  const isClosure = CLOSURE_PATTERNS.some((pattern) => texteLower.includes(pattern.toLowerCase()))

  // Rechercher le type de procédure
  for (const pattern of PROCEDURE_PATTERNS) {
    const found = pattern.keywords.some((keyword) => texteLower.includes(keyword.toLowerCase()))

    if (found) {
      return {
        type: pattern.type,
        // Réduire la gravité si c'est une clôture
        severity: isClosure ? Math.max(1, pattern.severity - 2) : pattern.severity,
      }
    }
  }

  return null
}

/**
 * Analyse les observations RCS pour détecter les procédures collectives
 *
 * @param observations - Liste des observations RCS
 * @returns Résultat de l'analyse avec type, date et détails de la procédure
 */
export function detectProcedureCollective(
  observations: RCSObservation[]
): ProcedureCollectiveResult {
  const detectedProcedures: {
    type: ProcedureType
    date: string
    texte: string
    code: string
    severity: number
  }[] = []

  for (const obs of observations) {
    const detection = detectProcedureInText(obs.texte)
    if (detection) {
      detectedProcedures.push({
        type: detection.type,
        date: obs.date,
        texte: obs.texte,
        code: obs.code,
        severity: detection.severity,
      })
    }
  }

  if (detectedProcedures.length === 0) {
    return {
      hasProcedure: false,
      type: null,
      date: null,
      details: null,
      allProcedures: [],
      severityLevel: 0,
    }
  }

  // Trier par gravité décroissante, puis par date décroissante
  detectedProcedures.sort((a, b) => {
    if (b.severity !== a.severity) {
      return b.severity - a.severity
    }
    return b.date.localeCompare(a.date)
  })

  const mostSevere = detectedProcedures[0]

  return {
    hasProcedure: true,
    type: mostSevere.type,
    date: mostSevere.date,
    details: mostSevere.texte,
    allProcedures: detectedProcedures.map(({ type, date, texte, code }) => ({
      type,
      date,
      texte,
      code,
    })),
    severityLevel: mostSevere.severity,
  }
}

/**
 * Calcule un malus de score basé sur la procédure collective détectée
 *
 * @param result - Résultat de la détection de procédure
 * @returns Malus à appliquer au score (0 à -5 points sur 10)
 */
export function calculateProcedureMalus(result: ProcedureCollectiveResult): number {
  if (!result.hasProcedure) {
    return 0
  }

  // Malus basé sur le niveau de gravité
  // Niveau 5 (liquidation) = -5 points
  // Niveau 4 (redressement) = -4 points
  // Niveau 3 (sauvegarde) = -3 points
  // Niveau 2 (plan continuation) = -1 point
  // Niveau 1 (clôture positive) = 0 point

  switch (result.severityLevel) {
    case 5:
      return -5
    case 4:
      return -4
    case 3:
      return -3
    case 2:
      return -1
    default:
      return 0
  }
}

/**
 * Retourne un libellé lisible pour le type de procédure
 */
export function getProcedureLabel(type: ProcedureType): string {
  const labels: Record<ProcedureType, string> = {
    liquidation: 'Liquidation judiciaire',
    redressement: 'Redressement judiciaire',
    sauvegarde: 'Procédure de sauvegarde',
    cessation_paiements: 'Cessation des paiements',
    plan_continuation: 'Plan de continuation',
    plan_cession: 'Plan de cession',
    autre: 'Procédure collective',
  }

  return labels[type]
}

/**
 * Retourne une couleur associée au niveau de gravité
 */
export function getProcedureSeverityColor(severityLevel: number): {
  bg: string
  text: string
  border: string
} {
  if (severityLevel >= 4) {
    return {
      bg: 'bg-red-100 dark:bg-red-950/50',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-300 dark:border-red-800',
    }
  }

  if (severityLevel >= 3) {
    return {
      bg: 'bg-orange-100 dark:bg-orange-950/50',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-300 dark:border-orange-800',
    }
  }

  if (severityLevel >= 2) {
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-950/50',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-300 dark:border-yellow-800',
    }
  }

  return {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-700',
  }
}
