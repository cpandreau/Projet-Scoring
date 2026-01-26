import type { FamilyId } from '@/config/ratios.config'
import type { SanteSecteur, TendanceSecteur } from '@/types/territorial'

export const SANTE_CONFIG: Record<SanteSecteur, { label: string; emoji: string; color: string }> = {
  dynamique: { label: 'Dynamique', emoji: '🟢', color: 'text-green-600' },
  stable: { label: 'Stable', emoji: '🟡', color: 'text-yellow-600' },
  difficulte: { label: 'En difficulté', emoji: '🔴', color: 'text-red-600' },
}

export const TENDANCE_CONFIG: Record<
  TendanceSecteur,
  { label: string; emoji: string; color: string }
> = {
  croissance: { label: 'En croissance', emoji: '↗️', color: 'text-green-600' },
  stable: { label: 'Stable', emoji: '➡️', color: 'text-yellow-600' },
  declin: { label: 'En déclin', emoji: '↘️', color: 'text-red-600' },
}

export const FAMILY_ORDER: FamilyId[] = [
  'liquidite',
  'rentabilite',
  'solvabilite',
  'activite',
  'evolution',
]
