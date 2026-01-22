"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CreateEnterpriseData, EnterpriseStatus } from "@/types";

export async function createEnterprise(data: CreateEnterpriseData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié" };
  }

  const { data: enterprise, error } = await supabase
    .from("dossiers")
    .insert({
      user_id: user.id,
      siren: data.siren,
      siret: data.siret || null,
      raison_sociale: data.raison_sociale,
      forme_juridique: data.forme_juridique || null,
      code_naf: data.code_naf || null,
      adresse: data.adresse || null,
      statut: "brouillon",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating enterprise:", error);
    return { error: "Erreur lors de la création du dossier" };
  }

  revalidatePath("/enterprise");
  redirect(`/enterprise/${enterprise.id}`);
}

export async function updateEnterpriseStatus(
  id: string,
  statut: EnterpriseStatus
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dossiers")
    .update({ statut })
    .eq("id", id);

  if (error) {
    console.error("Error updating enterprise status:", error);
    return { error: "Erreur lors de la mise à jour du statut" };
  }

  revalidatePath(`/enterprise/${id}`);
  revalidatePath("/enterprise");

  return { success: true };
}

export async function deleteEnterprise(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("dossiers").delete().eq("id", id);

  if (error) {
    console.error("Error deleting enterprise:", error);
    return { error: "Erreur lors de la suppression du dossier" };
  }

  revalidatePath("/enterprise");
  redirect("/enterprise");
}
