import { createClient } from "@/lib/supabase/server";
import type { Enterprise } from "@/types";

export async function getEnterprisesByUser(
  userId: string
): Promise<Enterprise[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dossiers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching enterprises:", error);
    return [];
  }

  return data as Enterprise[];
}

export async function getEnterpriseById(
  id: string
): Promise<Enterprise | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dossiers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching enterprise:", error);
    return null;
  }

  return data as Enterprise;
}
