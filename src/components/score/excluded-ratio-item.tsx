"use client";

import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ExcludedRatio } from "@/lib/ratios";
import { RATIOS } from "@/config/ratios.config";

interface ExcludedRatioItemProps {
  excluded: ExcludedRatio;
}

/**
 * Composant pour afficher un ratio exclu du calcul de score
 * Affiche le nom du ratio, un badge "N/A" et la raison de l'exclusion
 */
export function ExcludedRatioItem({ excluded }: ExcludedRatioItemProps) {
  const ratioDef = RATIOS[excluded.key];
  const ratioName = ratioDef?.nom ?? excluded.key;

  return (
    <div
      className="flex flex-col gap-0.5 py-1.5 opacity-60"
      title={excluded.reason}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground truncate mr-2">
          <Info className="h-3.5 w-3.5 shrink-0" />
          {ratioName}
        </span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          N/A
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground pl-5 truncate">
        {excluded.reason}
      </p>
    </div>
  );
}
