import Link from "next/link";
import type { RecentEnterprise } from "@/repositories/stats.repository";
import { STATUT_LABELS, STATUT_COLORS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getScoreZone, getZoneTextClasses } from "@/config/colors.config";
import { ArrowRight, Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentEnterprisesProps {
  enterprises: RecentEnterprise[];
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function RecentEnterprises({ enterprises }: RecentEnterprisesProps) {
  if (enterprises.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Entreprises récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm mb-4">
              Aucune entreprise pour le moment
            </p>
            <Button asChild size="sm">
              <Link href="/enterprise/new">Créer un dossier</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Entreprises récentes</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href="/enterprise">
            Voir toutes
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {enterprises.map((enterprise) => {
            const zone = enterprise.score !== null ? getScoreZone(enterprise.score) : null;

            return (
              <Link
                key={enterprise.id}
                href={`/enterprise/${enterprise.id}`}
                className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {enterprise.raison_sociale || "Sans nom"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(enterprise.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {enterprise.score !== null && zone && (
                    <span className={cn("text-sm font-medium tabular-nums", getZoneTextClasses(zone))}>
                      {enterprise.score.toFixed(1)}
                    </span>
                  )}
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", STATUT_COLORS[enterprise.statut])}
                  >
                    {STATUT_LABELS[enterprise.statut]}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
