import type { Enterprise } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusIndicator } from "./status-indicator";

interface EnterpriseDetailProps {
  enterprise: Enterprise;
}

export function EnterpriseDetail({ enterprise }: EnterpriseDetailProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{enterprise.raison_sociale || "Sans nom"}</CardTitle>
            <CardDescription>SIREN: {enterprise.siren}</CardDescription>
          </div>
          <StatusIndicator status={enterprise.statut} />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">SIREN</dt>
            <dd className="text-sm">{enterprise.siren || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">SIRET</dt>
            <dd className="text-sm">{enterprise.siret || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Forme juridique
            </dt>
            <dd className="text-sm">{enterprise.forme_juridique || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Code NAF
            </dt>
            <dd className="text-sm">{enterprise.code_naf || "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">
              Adresse
            </dt>
            <dd className="text-sm">{enterprise.adresse || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Date de création
            </dt>
            <dd className="text-sm">
              {new Date(enterprise.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
