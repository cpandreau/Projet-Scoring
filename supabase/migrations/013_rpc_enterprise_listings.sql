-- =============================================
-- RPC: get_enterprises_with_scores
-- Description: Récupère les entreprises avec leur dernier score calculé
-- Remplace: 2 requêtes + calcul score JS côté client
-- =============================================

CREATE OR REPLACE FUNCTION get_enterprises_with_scores(
  p_user_id UUID DEFAULT NULL,
  p_creator_filter TEXT DEFAULT 'all',
  p_limit INTEGER DEFAULT 500
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(enterprise_with_score)
  INTO v_result
  FROM (
    SELECT
      d.*,
      (
        SELECT sh.score_global
        FROM scores_history sh
        WHERE sh.enterprise_id = d.id
        ORDER BY sh.created_at DESC
        LIMIT 1
      ) as score
    FROM dossiers d
    WHERE d.deleted_at IS NULL
      AND (
        p_creator_filter = 'all'
        OR (p_creator_filter = 'mine' AND d.user_id = p_user_id)
        OR (p_creator_filter NOT IN ('all', 'mine') AND d.created_by_email = p_creator_filter)
      )
    ORDER BY d.created_at DESC
    LIMIT p_limit
  ) enterprise_with_score;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION get_enterprises_with_scores(UUID, TEXT, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_enterprises_with_scores IS 'Récupère les entreprises avec leur dernier score. Supporte filtrage par créateur.';


-- =============================================
-- RPC: get_recent_enterprises
-- Description: Entreprises récentes avec leur score
-- =============================================

CREATE OR REPLACE FUNCTION get_recent_enterprises(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(recent)
  INTO v_result
  FROM (
    SELECT
      d.*,
      (
        SELECT sh.score_global
        FROM scores_history sh
        WHERE sh.enterprise_id = d.id
        ORDER BY sh.created_at DESC
        LIMIT 1
      ) as score
    FROM dossiers d
    WHERE d.user_id = p_user_id
      AND d.deleted_at IS NULL
    ORDER BY d.created_at DESC
    LIMIT p_limit
  ) recent;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION get_recent_enterprises(UUID, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_recent_enterprises IS 'Récupère les entreprises récentes avec leur score pour le dashboard.';


-- =============================================
-- RPC: get_at_risk_enterprises
-- Description: Entreprises avec score < 5 triées par risque
-- =============================================

CREATE OR REPLACE FUNCTION get_at_risk_enterprises(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(at_risk)
  INTO v_result
  FROM (
    SELECT
      d.id,
      d.siren,
      d.raison_sociale,
      latest.score
    FROM dossiers d
    INNER JOIN LATERAL (
      SELECT sh.score_global as score
      FROM scores_history sh
      WHERE sh.enterprise_id = d.id
      ORDER BY sh.created_at DESC
      LIMIT 1
    ) latest ON true
    WHERE d.user_id = p_user_id
      AND d.deleted_at IS NULL
      AND d.statut = 'analyse'
      AND latest.score < 5
    ORDER BY latest.score ASC
    LIMIT p_limit
  ) at_risk;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION get_at_risk_enterprises(UUID, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_at_risk_enterprises IS 'Récupère les entreprises à risque (score < 5) triées par score croissant.';
