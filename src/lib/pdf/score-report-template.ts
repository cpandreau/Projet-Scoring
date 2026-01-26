// Couleurs
export const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  white: '#ffffff',
  black: '#1f2937',
}

export function getScoreColor(score: number): string {
  if (score >= 7) return COLORS.success
  if (score >= 5) return COLORS.warning
  return COLORS.danger
}

export function getVerdict(score: number): string {
  if (score >= 7) return 'Bonne sante financiere'
  if (score >= 5) return 'Sante financiere moyenne'
  return 'Situation a risque'
}

export function getZoneLabel(zone: string): string {
  switch (zone) {
    case 'vert':
      return 'Bon'
    case 'jaune':
      return 'Moyen'
    case 'rouge':
      return 'Risque'
    default:
      return 'N/A'
  }
}
