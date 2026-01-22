"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSectorComparison } from "@/actions/sector-comparison.actions";
import type {
  SectorComparisonResult,
  PositionSectorielle,
} from "@/lib/api/sector-comparison";

interface SectorComparisonProps {
  enterpriseId: string;
}

const POSITION_CONFIG: Record<
  PositionSectorielle,
  { label: string; color: string; bgColor: string }
> = {
  top10: { label: "Top 10%", color: "text-green-700", bgColor: "bg-green-100" },
  top25: { label: "Top 25%", color: "text-green-600", bgColor: "bg-green-50" },
  median_sup: {
    label: "Au-dessus mediane",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  median_inf: {
    label: "Sous mediane",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  bottom25: {
    label: "Bottom 25%",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  bottom10: {
    label: "Bottom 10%",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  non_disponible: {
    label: "N/A",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
};

function formatNumber(value: number, unite: string): string {
  if (unite === "jours" || unite === "annees") {
    return `${Math.round(value)} ${unite === "jours" ? "j" : "ans"}`;
  }
  return `${value.toFixed(1)}${unite === "%" ? "%" : ""}`;
}

export function SectorComparison({ enterpriseId }: SectorComparisonProps) {
  const [data, setData] = useState<SectorComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await getSectorComparison(enterpriseId);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [enterpriseId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger la comparaison sectorielle.
        </AlertDescription>
      </Alert>
    );
  }

  if (data.error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{data.error}</AlertDescription>
      </Alert>
    );
  }

  if (data.comparisons.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Aucune donnee de comparaison disponible pour ce secteur (NAF{" "}
          {data.classeNaf}).
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg">Position sectorielle</CardTitle>
            <CardDescription>
              Comparaison avec {data.cohorte.toLocaleString()} entreprises du
              secteur ({data.classeCA})
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            NAF {data.classeNaf} - {data.exercice}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.comparisons.map((comparison) => {
            const config = POSITION_CONFIG[comparison.position];

            return (
              <div key={comparison.ratioId} className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comparison.nom}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <div className="text-xs space-y-1">
                            <p>Q10: {comparison.q10?.toFixed(1) || "N/A"}</p>
                            <p>Q25: {comparison.q25?.toFixed(1) || "N/A"}</p>
                            <p>
                              <strong>
                                Mediane: {comparison.q50?.toFixed(1) || "N/A"}
                              </strong>
                            </p>
                            <p>Q75: {comparison.q75?.toFixed(1) || "N/A"}</p>
                            <p>Q90: {comparison.q90?.toFixed(1) || "N/A"}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">
                      {formatNumber(comparison.valeurEntreprise, comparison.unite)}
                    </span>
                    <Badge className={`${config.bgColor} ${config.color} text-xs`}>
                      {config.label}
                    </Badge>
                  </div>
                </div>

                {/* Barre de progression avec position */}
                <div className="relative">
                  <Progress value={comparison.percentileEstime} className="h-2" />
                  {/* Marqueur de mediane */}
                  <div
                    className="absolute top-0 w-0.5 h-2 bg-gray-400"
                    style={{ left: "50%" }}
                  />
                </div>

                {/* Ecart par rapport a la mediane */}
                {comparison.ecartMediane !== null && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {comparison.ecartMediane > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : comparison.ecartMediane < 0 ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    <span>
                      {comparison.ecartMediane > 0 ? "+" : ""}
                      {comparison.ecartMediane.toFixed(0)}% vs mediane (
                      {comparison.q50?.toFixed(1)}
                      {comparison.unite === "%" ? "%" : ` ${comparison.unite}`})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Source : API data.economie.gouv.fr (BCE/INPI) - Donnees {data.exercice}
        </p>
      </CardContent>
    </Card>
  );
}
