"use client";

import { useState, useCallback } from "react";
import { createEnterprise, updateEnterpriseStatus, deleteEnterprise } from "@/actions/enterprise.actions";
import { searchSirene } from "@/actions/sirene.actions";
import { showSuccess, showError } from "@/lib/toast";
import type { CreateEnterpriseData, EnterpriseStatus, SireneResult } from "@/types";

// Hook pour la recherche SIRENE
export function useSireneSearch() {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SireneResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setError("La recherche doit contenir au moins 3 caractères");
      return { success: false };
    }

    setSearching(true);
    setError(null);
    setResults([]);

    const result = await searchSirene(query);

    if (result.error) {
      console.error("Erreur recherche SIRENE:", result.error);
      setError(result.error);
      setSearching(false);
      return { success: false, error: result.error };
    }

    if (result.results && result.results.length === 0) {
      setError("Aucun résultat trouvé");
      setSearching(false);
      return { success: true, empty: true };
    }

    if (result.results) {
      setResults(result.results);
    }

    setSearching(false);
    return { success: true, results: result.results };
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    searching,
    results,
    error,
    search,
    clearResults,
  };
}

// Hook pour la création d'entreprise
export function useCreateEnterprise() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateEnterpriseData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createEnterprise(data);
      // createEnterprise fait un redirect en cas de succès
      // On arrive ici seulement en cas d'erreur
      if (result?.error) {
        console.error("Erreur création dossier:", result.error);
        setError(result.error);
        showError("Erreur lors de la création", result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
      showSuccess("Dossier créé avec succès");
    } catch {
      // Le redirect lance une exception côté client, c'est normal
      // Si on arrive ici sans erreur, c'est que le redirect a fonctionné
      showSuccess("Dossier créé avec succès");
    }

    setLoading(false);
    return { success: true };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    create,
    clearError,
  };
}

// Hook pour la mise à jour du statut d'une entreprise
export function useUpdateEnterpriseStatus() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: string, statut: EnterpriseStatus) => {
    setUpdating(true);
    setError(null);

    const result = await updateEnterpriseStatus(id, statut);

    if (result.error) {
      console.error("Erreur mise à jour statut:", result.error);
      setError(result.error);
      showError("Erreur lors de la mise à jour", result.error);
    } else {
      showSuccess("Statut mis à jour");
    }

    setUpdating(false);
    return result;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updating,
    error,
    update,
    clearError,
  };
}

// Hook pour la suppression d'une entreprise
export function useDeleteEnterprise() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: string, name: string, skipConfirm = false) => {
    if (!skipConfirm && !confirm(`Êtes-vous sûr de vouloir supprimer le dossier "${name}" ?`)) {
      return { cancelled: true };
    }

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteEnterprise(id);
      // deleteEnterprise fait un redirect en cas de succès
      if (result?.error) {
        console.error("Erreur suppression dossier:", result.error);
        setError(result.error);
        showError("Erreur lors de la suppression", result.error);
        setDeleting(false);
        return { success: false, error: result.error };
      }
      showSuccess("Dossier supprimé");
    } catch {
      // Le redirect lance une exception côté client
      showSuccess("Dossier supprimé");
    }

    setDeleting(false);
    return { success: true };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deleting,
    error,
    remove,
    clearError,
  };
}

// Hook utilitaire pour pré-remplir un formulaire depuis un résultat SIRENE
export function useFormAutoFill(formRef: React.RefObject<HTMLFormElement | null>) {
  const fillFromSirene = useCallback((result: SireneResult) => {
    if (!formRef.current) return;

    const form = formRef.current;
    const setValue = (name: string, value: string) => {
      const element = form.elements.namedItem(name) as HTMLInputElement | null;
      if (element) {
        element.value = value;
      }
    };

    setValue("siren", result.siren);
    setValue("siret", result.siret);
    setValue("raison_sociale", result.raison_sociale);
    setValue("forme_juridique", result.forme_juridique);
    setValue("code_naf", result.code_naf);
    setValue("adresse", result.adresse);
  }, [formRef]);

  return { fillFromSirene };
}
