export type EnterpriseStatus =
  | "brouillon"
  | "documents_uploades"
  | "extrait"
  | "valide"
  | "analyse";

export interface Enterprise {
  id: string;
  created_at: string;
  user_id: string;
  siren: string | null;
  siret: string | null;
  raison_sociale: string | null;
  forme_juridique: string | null;
  code_naf: string | null;
  adresse: string | null;
  statut: EnterpriseStatus;
}

export interface CreateEnterpriseData {
  siren: string;
  siret?: string;
  raison_sociale: string;
  forme_juridique?: string;
  code_naf?: string;
  adresse?: string;
}

export const STATUT_LABELS: Record<EnterpriseStatus, string> = {
  brouillon: "Brouillon",
  documents_uploades: "Documents uploadés",
  extrait: "Extrait",
  valide: "Validé",
  analyse: "Analysé",
};

export const STATUT_COLORS: Record<EnterpriseStatus, string> = {
  brouillon: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  documents_uploades:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  extrait:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  valide: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  analyse:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};
