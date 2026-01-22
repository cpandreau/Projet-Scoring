import Link from "next/link";
import { EnterpriseForm } from "@/components/enterprise";

export default function NewEnterprisePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/enterprise"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour aux dossiers
        </Link>
      </div>

      <EnterpriseForm />
    </div>
  );
}
