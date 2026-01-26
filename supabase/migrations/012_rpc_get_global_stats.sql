-- =============================================
-- RPC: get_global_stats
-- Description: Récupère toutes les stats du dashboard en une seule requête
-- Remplace: 4 requêtes séquentielles + calcul JS
-- =============================================

CREATE OR REPLACE FUNCTION get_global_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_total_enterprises INTEGER := 0;
  v_total_documents INTEGER := 0;
  v_documents_validated INTEGER := 0;
  v_analyzed_enterprises INTEGER := 0;
  v_status_counts JSON;
  v_score_distribution JSON;
  v_avg_score NUMERIC;
BEGIN
  -- 1. Compter les entreprises actives par statut
  SELECT
    COUNT(*),
    json_build_object(
      'brouillon', COUNT(*) FILTER (WHERE statut = 'brouillon'),
      'documents_uploades', COUNT(*) FILTER (WHERE statut = 'documents_uploades'),
      'extrait', COUNT(*) FILTER (WHERE statut = 'extrait'),
      'valide', COUNT(*) FILTER (WHERE statut = 'valide'),
      'analyse', COUNT(*) FILTER (WHERE statut = 'analyse')
    ),
    COUNT(*) FILTER (WHERE statut = 'analyse')
  INTO v_total_enterprises, v_status_counts, v_analyzed_enterprises
  FROM dossiers
  WHERE user_id = p_user_id
    AND deleted_at IS NULL;

  -- 2. Compter les documents des entreprises de l'utilisateur
  SELECT COUNT(*)
  INTO v_total_documents
  FROM documents d
  INNER JOIN dossiers dos ON d.dossier_id = dos.id
  WHERE dos.user_id = p_user_id
    AND dos.deleted_at IS NULL;

  -- 3. Compter les documents avec extraction validée
  SELECT COUNT(DISTINCT d.id)
  INTO v_documents_validated
  FROM donnees_extraites de
  INNER JOIN documents d ON de.document_id = d.id
  INNER JOIN dossiers dos ON d.dossier_id = dos.id
  WHERE dos.user_id = p_user_id
    AND dos.deleted_at IS NULL
    AND de.is_validated = true;

  -- 4. Distribution des scores et score moyen
  -- Utilise le dernier score de chaque entreprise depuis scores_history
  WITH latest_scores AS (
    SELECT DISTINCT ON (sh.enterprise_id)
      sh.score_global as score
    FROM scores_history sh
    INNER JOIN dossiers dos ON sh.enterprise_id = dos.id
    WHERE dos.user_id = p_user_id
      AND dos.deleted_at IS NULL
    ORDER BY sh.enterprise_id, sh.created_at DESC
  )
  SELECT
    json_build_object(
      'critical', COUNT(*) FILTER (WHERE score < 4),
      'warning', COUNT(*) FILTER (WHERE score >= 4 AND score < 6),
      'good', COUNT(*) FILTER (WHERE score >= 6 AND score < 8),
      'excellent', COUNT(*) FILTER (WHERE score >= 8)
    ),
    ROUND(AVG(score)::numeric, 2)
  INTO v_score_distribution, v_avg_score
  FROM latest_scores;

  -- Construire le résultat JSON
  v_result := json_build_object(
    'totalEnterprises', COALESCE(v_total_enterprises, 0),
    'enterprisesByStatus', COALESCE(v_status_counts, json_build_object(
      'brouillon', 0,
      'documents_uploades', 0,
      'extrait', 0,
      'valide', 0,
      'analyse', 0
    )),
    'totalDocuments', COALESCE(v_total_documents, 0),
    'documentsValidated', COALESCE(v_documents_validated, 0),
    'analyzedEnterprises', COALESCE(v_analyzed_enterprises, 0),
    'averageScore', v_avg_score,
    'scoreDistribution', COALESCE(v_score_distribution, json_build_object(
      'critical', 0,
      'warning', 0,
      'good', 0,
      'excellent', 0
    ))
  );

  RETURN v_result;
END;
$$;

-- Accorder les permissions aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION get_global_stats(UUID) TO authenticated;

-- Commentaire de documentation
COMMENT ON FUNCTION get_global_stats IS 'Récupère les statistiques globales du dashboard pour un utilisateur. Remplace 4 requêtes séquentielles par une seule RPC.';
