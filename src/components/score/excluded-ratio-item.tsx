import { Info } from 'lucide-react'
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { RATIOS } from '@/config/ratios.config'
import type { ExcludedRatio } from '@/lib/ratios'

interface ExcludedRatioItemProps {
  excluded: ExcludedRatio
}

/**
 * Composant pour afficher un ratio exclu du calcul de score
 * Affiche le nom du ratio, un badge "N/A" et la raison de l'exclusion
 */
export const ExcludedRatioItem = memo(function ExcludedRatioItem({
  excluded,
}: ExcludedRatioItemProps) {
  const ratioDef = RATIOS[excluded.key]
  const ratioName = ratioDef?.nom ?? excluded.key

  return (
    <div className="flex flex-col gap-0.5 py-1.5 opacity-60" title={excluded.reason}>
      <div className="flex items-center justify-between text-sm">
        <span className="mr-2 flex items-center gap-1.5 truncate text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          {ratioName}
        </span>
        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
          N/A
        </Badge>
      </div>
      <p className="truncate pl-5 text-muted-foreground text-xs">{excluded.reason}</p>
    </div>
  )
})

ExcludedRatioItem.displayName = 'ExcludedRatioItem'
