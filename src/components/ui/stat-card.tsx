import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import { memo, type ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  /** Icône à afficher */
  icon: ReactNode
  /** Label de la statistique */
  label: string
  /** Valeur principale */
  value: string
  /** Sous-label optionnel */
  sublabel?: string
  /** Tendance optionnelle */
  trend?: 'up' | 'down' | 'stable'
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Carte de statistique avec icône, valeur et tendance optionnelle
 * Mémoïsé avec comparaison sur props primitives (icon ignoré car ReactNode)
 */
export const StatCard = memo(function StatCard({
  icon,
  label,
  value,
  sublabel,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-2xl">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-sm',
              trend === 'up' && 'text-green-600',
              trend === 'down' && 'text-red-600',
              trend === 'stable' && 'text-muted-foreground'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </span>
        )}
      </div>
      {sublabel && <p className="mt-1 text-muted-foreground text-xs">{sublabel}</p>}
    </Card>
  )
}, arePropsEqual)

/** Compare primitive props only (icon is ReactNode, always recreated) */
function arePropsEqual(prev: StatCardProps, next: StatCardProps): boolean {
  return (
    prev.label === next.label &&
    prev.value === next.value &&
    prev.sublabel === next.sublabel &&
    prev.trend === next.trend &&
    prev.className === next.className
  )
}

StatCard.displayName = 'StatCard'
