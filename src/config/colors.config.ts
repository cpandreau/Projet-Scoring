/**
 * Configuration centralisée des couleurs de l'application
 * Pour une cohérence visuelle entre tous les composants
 */

export type Zone = 'vert' | 'jaune' | 'orange' | 'rouge'

export type ScoreLevel = 'excellent' | 'bon' | 'moyen' | 'faible'

// Couleurs par zone (pour les ratios individuels)
export interface ZoneColors {
  bg: string
  bgDark: string
  text: string
  textDark: string
  border: string
  borderDark: string
  fill: string // Pour les graphiques (rgba)
  stroke: string // Pour les graphiques (rgb)
  strokeClass: string // Classe Tailwind pour SVG stroke
  label: string // Label d'interprétation du score
}

export const ZONE_COLORS: Record<Zone, ZoneColors> = {
  vert: {
    bg: 'bg-green-50',
    bgDark: 'dark:bg-green-950',
    text: 'text-green-700',
    textDark: 'dark:text-green-300',
    border: 'border-green-200',
    borderDark: 'dark:border-green-800',
    fill: 'rgba(34, 197, 94, 0.3)', // green-500
    stroke: 'rgb(34, 197, 94)',
    strokeClass: 'stroke-green-500',
    label: 'Excellent',
  },
  jaune: {
    bg: 'bg-yellow-50',
    bgDark: 'dark:bg-yellow-950',
    text: 'text-yellow-700',
    textDark: 'dark:text-yellow-300',
    border: 'border-yellow-200',
    borderDark: 'dark:border-yellow-800',
    fill: 'rgba(234, 179, 8, 0.3)', // yellow-500
    stroke: 'rgb(234, 179, 8)',
    strokeClass: 'stroke-yellow-500',
    label: 'Correct',
  },
  orange: {
    bg: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950',
    text: 'text-orange-700',
    textDark: 'dark:text-orange-300',
    border: 'border-orange-200',
    borderDark: 'dark:border-orange-800',
    fill: 'rgba(249, 115, 22, 0.3)', // orange-500
    stroke: 'rgb(249, 115, 22)',
    strokeClass: 'stroke-orange-500',
    label: 'Moyen',
  },
  rouge: {
    bg: 'bg-red-50',
    bgDark: 'dark:bg-red-950',
    text: 'text-red-700',
    textDark: 'dark:text-red-300',
    border: 'border-red-200',
    borderDark: 'dark:border-red-800',
    fill: 'rgba(239, 68, 68, 0.3)', // red-500
    stroke: 'rgb(239, 68, 68)',
    strokeClass: 'stroke-red-500',
    label: 'Risque',
  },
}

/**
 * Retourne les classes CSS pour une zone donnée
 */
export function getZoneColors(zone: Zone): ZoneColors {
  return ZONE_COLORS[zone]
}

/**
 * Retourne les classes CSS combinées pour le background
 */
export function getZoneBgClasses(zone: Zone): string {
  const colors = ZONE_COLORS[zone]
  return `${colors.bg} ${colors.bgDark}`
}

/**
 * Retourne les classes CSS combinées pour le texte
 */
export function getZoneTextClasses(zone: Zone): string {
  const colors = ZONE_COLORS[zone]
  return `${colors.text} ${colors.textDark}`
}

/**
 * Retourne les classes CSS combinées pour la bordure
 */
export function getZoneBorderClasses(zone: Zone): string {
  const colors = ZONE_COLORS[zone]
  return `${colors.border} ${colors.borderDark}`
}

/**
 * Détermine la zone (couleur) en fonction d'un score sur 10
 */
export function getScoreZone(score: number): Zone {
  if (score >= 8) return 'vert'
  if (score >= 6) return 'jaune'
  if (score >= 4) return 'orange'
  return 'rouge'
}

/**
 * Labels pour chaque zone
 */
export const ZONE_LABELS: Record<Zone, string> = {
  vert: 'Bon',
  jaune: 'Vigilance',
  orange: 'Alerte',
  rouge: 'Critique',
}
