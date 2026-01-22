import { createClient } from "@/lib/supabase/server";
import type { Document } from "@/types/document";

export async function getDocumentsByEnterprise(
  enterpriseId: string
): Promise<Document[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("dossier_id", enterpriseId)
    .order("annee_exercice", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return data as Document[];
}
