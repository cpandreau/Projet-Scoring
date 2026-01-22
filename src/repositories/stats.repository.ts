import { createClient } from "@/lib/supabase/server";
import type { EnterpriseStatus, Enterprise } from "@/types";

export interface GlobalStats {
  // Entreprises
  totalEnterprises: number;
  enterprisesByStatus: Record<EnterpriseStatus, number>;

  // Documents
  totalDocuments: number;
  documentsValidated: number;

  // Scores
  analyzedEnterprises: number;
  averageScore: number | null;
  scoreDistribution: {
    critical: number;   // < 4
    warning: number;    // 4-6
    good: number;       // 6-8
    excellent: number;  // >= 8
  };
}

/**
 * Récupère les statistiques globales pour un utilisateur
 */
export async function getGlobalStats(userId: string): Promise<GlobalStats> {
  const supabase = await createClient();

  // Initialiser les stats par défaut
  const stats: GlobalStats = {
    totalEnterprises: 0,
    enterprisesByStatus: {
      brouillon: 0,
      documents_uploades: 0,
      extrait: 0,
      valide: 0,
      analyse: 0,
    },
    totalDocuments: 0,
    documentsValidated: 0,
    analyzedEnterprises: 0,
    averageScore: null,
    scoreDistribution: {
      critical: 0,
      warning: 0,
      good: 0,
      excellent: 0,
    },
  };

  // 1. Récupérer toutes les entreprises de l'utilisateur
  const { data: enterprises, error: enterprisesError } = await supabase
    .from("dossiers")
    .select("id, statut")
    .eq("user_id", userId);

  if (enterprisesError) {
    console.error("Error fetching enterprises for stats:", enterprisesError);
    return stats;
  }

  if (!enterprises || enterprises.length === 0) {
    return stats;
  }

  // Compter les entreprises par statut
  stats.totalEnterprises = enterprises.length;
  for (const enterprise of enterprises) {
    const statut = enterprise.statut as EnterpriseStatus;
    if (statut in stats.enterprisesByStatus) {
      stats.enterprisesByStatus[statut]++;
    }
  }

  // Entreprises analysées = statut "analyse"
  stats.analyzedEnterprises = stats.enterprisesByStatus.analyse;

  // 2. Récupérer les IDs des dossiers pour les requêtes suivantes
  const enterpriseIds = enterprises.map((e) => e.id);

  // 3. Compter les documents
  const { count: documentsCount, error: documentsError } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .in("dossier_id", enterpriseIds);

  if (!documentsError && documentsCount !== null) {
    stats.totalDocuments = documentsCount;
  }

  // 4. Compter les extractions validées (= documents validés)
  const { data: validatedDocs, error: validatedError } = await supabase
    .from("donnees_extraites")
    .select("document_id, documents!inner(dossier_id)")
    .eq("is_validated", true)
    .in("documents.dossier_id", enterpriseIds);

  if (!validatedError && validatedDocs) {
    stats.documentsValidated = validatedDocs.length;
  }

  // 5. Récupérer les scores des entreprises analysées
  // On récupère la dernière extraction validée par entreprise pour calculer un score
  if (stats.analyzedEnterprises > 0) {
    const analyzedIds = enterprises
      .filter((e) => e.statut === "analyse")
      .map((e) => e.id);

    // Récupérer les extractions validées des entreprises analysées
    const { data: extractions, error: extractionsError } = await supabase
      .from("donnees_extraites")
      .select("donnees, documents!inner(dossier_id, annee_exercice)")
      .eq("is_validated", true)
      .in("documents.dossier_id", analyzedIds);

    if (!extractionsError && extractions && extractions.length > 0) {
      // Calculer les scores pour chaque entreprise
      const { calculateRatios, calculateScore } = await import("@/lib/ratios");

      // Grouper par entreprise et garder l'année la plus récente
      const latestByEnterprise = new Map<string, { donnees: unknown; annee: number }>();

      for (const extraction of extractions) {
        const doc = extraction.documents as unknown as {
          dossier_id: string;
          annee_exercice: number | null
        };
        const dossierId = doc.dossier_id;
        const annee = doc.annee_exercice ?? 0;

        const existing = latestByEnterprise.get(dossierId);
        if (!existing || annee > existing.annee) {
          latestByEnterprise.set(dossierId, { donnees: extraction.donnees, annee });
        }
      }

      // Calculer les scores
      const scores: number[] = [];
      const { extractValues } = await import("@/schemas/extraction.schema");

      for (const [, { donnees }] of latestByEnterprise) {
        try {
          const extractionData = donnees as Parameters<typeof calculateRatios>[0];
          const ratios = calculateRatios(extractionData);
          const valeurs = extractValues(extractionData);
          const scoreResult = calculateScore(ratios, valeurs);
          scores.push(scoreResult.scoreGlobal);

          // Distribution des scores
          if (scoreResult.scoreGlobal < 4) {
            stats.scoreDistribution.critical++;
          } else if (scoreResult.scoreGlobal < 6) {
            stats.scoreDistribution.warning++;
          } else if (scoreResult.scoreGlobal < 8) {
            stats.scoreDistribution.good++;
          } else {
            stats.scoreDistribution.excellent++;
          }
        } catch (error) {
          console.error("Error calculating score for stats:", error);
        }
      }

      // Calculer le score moyen
      if (scores.length > 0) {
        stats.averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      }
    }
  }

  return stats;
}

/**
 * Entreprise récente avec score optionnel
 */
export interface RecentEnterprise extends Enterprise {
  score: number | null;
}

/**
 * Récupère les entreprises récentes avec leur score
 */
export async function getRecentEnterprises(
  userId: string,
  limit: number = 5
): Promise<RecentEnterprise[]> {
  const supabase = await createClient();

  // Récupérer les entreprises les plus récentes
  const { data: enterprises, error } = await supabase
    .from("dossiers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !enterprises) {
    console.error("Error fetching recent enterprises:", error);
    return [];
  }

  // Pour les entreprises analysées, récupérer leur score
  const analyzedIds = enterprises
    .filter((e) => e.statut === "analyse")
    .map((e) => e.id);

  const scoresMap = new Map<string, number>();

  if (analyzedIds.length > 0) {
    const { data: extractions, error: extractionsError } = await supabase
      .from("donnees_extraites")
      .select("donnees, documents!inner(dossier_id, annee_exercice)")
      .eq("is_validated", true)
      .in("documents.dossier_id", analyzedIds);

    if (!extractionsError && extractions && extractions.length > 0) {
      const { calculateRatios, calculateScore } = await import("@/lib/ratios");

      // Grouper par entreprise et garder l'année la plus récente
      const latestByEnterprise = new Map<string, { donnees: unknown; annee: number }>();

      for (const extraction of extractions) {
        const doc = extraction.documents as unknown as {
          dossier_id: string;
          annee_exercice: number | null;
        };
        const dossierId = doc.dossier_id;
        const annee = doc.annee_exercice ?? 0;

        const existing = latestByEnterprise.get(dossierId);
        if (!existing || annee > existing.annee) {
          latestByEnterprise.set(dossierId, { donnees: extraction.donnees, annee });
        }
      }

      // Calculer les scores
      const { extractValues } = await import("@/schemas/extraction.schema");
      for (const [dossierId, { donnees }] of latestByEnterprise) {
        try {
          const extractionData = donnees as Parameters<typeof calculateRatios>[0];
          const ratios = calculateRatios(extractionData);
          const valeurs = extractValues(extractionData);
          const scoreResult = calculateScore(ratios, valeurs);
          scoresMap.set(dossierId, scoreResult.scoreGlobal);
        } catch (error) {
          console.error("Error calculating score:", error);
        }
      }
    }
  }

  // Combiner entreprises avec scores
  return enterprises.map((enterprise) => ({
    ...enterprise,
    score: scoresMap.get(enterprise.id) ?? null,
  })) as RecentEnterprise[];
}
