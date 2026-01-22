import Link from "next/link";
import type { Enterprise } from "@/types";
import { EnterpriseCard } from "./enterprise-card";
import { Button } from "@/components/ui/button";

interface EnterpriseListProps {
  enterprises: Enterprise[];
}

export function EnterpriseList({ enterprises }: EnterpriseListProps) {
  if (enterprises.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground mb-4">
          Aucun dossier pour le moment.
        </p>
        <Button asChild>
          <Link href="/enterprise/new">Créer votre premier dossier</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {enterprises.map((enterprise) => (
        <li key={enterprise.id}>
          <EnterpriseCard enterprise={enterprise} />
        </li>
      ))}
    </ul>
  );
}
