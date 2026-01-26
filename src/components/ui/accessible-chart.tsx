'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AccessibleChartProps {
  children: ReactNode
  title: string
  description: string
  className?: string
}

/**
 * Wrapper accessible pour les graphiques Recharts
 * - Ajoute role="img" et aria-label pour les lecteurs d'écran
 * - Ajoute une description sr-only détaillée
 * - Rend le graphique focusable au clavier
 */
export function AccessibleChart({ children, title, description, className }: AccessibleChartProps) {
  return (
    <div
      role="img"
      aria-label={`Graphique: ${title}`}
      tabIndex={0}
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md',
        className
      )}
    >
      {/* Description pour lecteurs d'écran */}
      <p className="sr-only">{description}</p>

      {/* Le graphique */}
      {children}
    </div>
  )
}

/**
 * Couleurs des zones de score pour les graphiques
 * Couleurs directes compatibles avec tous les thèmes
 */
export const CHART_ZONE_COLORS = {
  // Zones de score
  danger: 'rgb(239, 68, 68)', // red-500
  warning: 'rgb(249, 115, 22)', // orange-500
  caution: 'rgb(234, 179, 8)', // yellow-500
  success: 'rgb(34, 197, 94)', // green-500
  // Couleurs utilitaires
  info: 'rgb(59, 130, 246)', // blue-500
  purple: 'rgb(168, 85, 247)', // purple-500
  neutral: 'rgb(148, 163, 184)', // slate-400
} as const

export type ChartZone = keyof typeof CHART_ZONE_COLORS

/**
 * Composant Tooltip personnalisé pour Recharts
 * Compatible thème clair/sombre via classes Tailwind
 */
interface ChartTooltipPayload {
  name: string
  value: number
  color?: string
  payload?: Record<string, unknown>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string
  formatter?: (value: number, name: string, payload: ChartTooltipPayload) => ReactNode
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-popover p-2 shadow-md">
      {label && <p className="mb-1 font-medium text-popover-foreground text-sm">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-2 text-popover-foreground text-sm">
          {entry.color && (
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
          )}
          {formatter ? (
            formatter(entry.value, entry.name, entry)
          ) : (
            <span>
              {entry.name}:{' '}
              {typeof entry.value === 'number' ? entry.value.toLocaleString('fr-FR') : entry.value}
            </span>
          )}
        </p>
      ))}
    </div>
  )
}
