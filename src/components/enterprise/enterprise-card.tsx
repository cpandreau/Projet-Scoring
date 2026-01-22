import Link from "next/link";
import type { Enterprise } from "@/types";
import { StatusIndicator } from "./status-indicator";

interface EnterpriseCardProps {
  enterprise: Enterprise;
}

export function EnterpriseCard({ enterprise }: EnterpriseCardProps) {
  return (
    <Link
      href={`/enterprise/${enterprise.id}`}
      className="block p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium">
            {enterprise.raison_sociale || "Sans nom"}
          </p>
          <p className="text-sm text-muted-foreground">
            SIREN: {enterprise.siren || "N/A"}
          </p>
        </div>
        <StatusIndicator status={enterprise.statut} />
      </div>
    </Link>
  );
}
