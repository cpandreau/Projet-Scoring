import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEnterprisesByUser } from "@/repositories/enterprise.repository";
import { EnterpriseList } from "@/components/enterprise";
import { Button } from "@/components/ui/button";

export default async function EnterprisePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const enterprises = await getEnterprisesByUser(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Entreprises</h2>
        <Button asChild>
          <Link href="/enterprise/new">Nouveau dossier</Link>
        </Button>
      </div>

      <section>
        <EnterpriseList enterprises={enterprises} />
      </section>
    </div>
  );
}
