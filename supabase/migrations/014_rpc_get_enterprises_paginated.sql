-- =============================================
-- RPC: get_enterprises_paginated
-- Description: Liste paginée avec recherche, tri et filtres
-- =============================================

CREATE OR REPLACE FUNCTION get_enterprises_paginated(
  p_user_id UUID,
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_score_zone TEXT DEFAULT NULL,
  p_creator_filter TEXT DEFAULT 'all',
  p_sort TEXT DEFAULT 'created_desc',
  p_page INTEGER DEFAULT 1,
  p_per_page INTEGER DEFAULT 15
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_offset INTEGER;
  v_total INTEGER;
  v_total_pages INTEGER;
  v_enterprises JSON;
BEGIN
  v_offset := (p_page - 1) * p_per_page;

  -- Count total with filters
  SELECT COUNT(*)
  INTO v_total
  FROM dossiers d
  LEFT JOIN LATERAL (
    SELECT score_global
    FROM scores_history
    WHERE enterprise_id = d.id
    ORDER BY created_at DESC
    LIMIT 1
  ) sh ON true
  WHERE d.deleted_at IS NULL
    AND (
      p_creator_filter = 'all'
      OR (p_creator_filter = 'mine' AND d.user_id = p_user_id)
      OR (p_creator_filter NOT IN ('all', 'mine') AND d.created_by_email = p_creator_filter)
    )
    AND (
      p_search IS NULL
      OR p_search = ''
      OR d.raison_sociale ILIKE '%' || p_search || '%'
      OR d.siren ILIKE '%' || p_search || '%'
    )
    AND (p_status IS NULL OR p_status = '' OR d.statut = p_status::statut_dossier)
    AND (
      p_score_zone IS NULL
      OR p_score_zone = ''
      OR (p_score_zone = 'danger' AND sh.score_global IS NOT NULL AND sh.score_global < 4)
      OR (p_score_zone = 'warning' AND sh.score_global IS NOT NULL AND sh.score_global >= 4 AND sh.score_global < 6)
      OR (p_score_zone = 'caution' AND sh.score_global IS NOT NULL AND sh.score_global >= 6 AND sh.score_global < 8)
      OR (p_score_zone = 'success' AND sh.score_global IS NOT NULL AND sh.score_global >= 8)
      OR (p_score_zone = 'none' AND sh.score_global IS NULL)
    );

  v_total_pages := GREATEST(1, CEIL(v_total::NUMERIC / p_per_page));

  -- Get enterprises with sort
  SELECT json_agg(row_to_json(enterprises_data))
  INTO v_enterprises
  FROM (
    SELECT
      d.id,
      d.siren,
      d.raison_sociale,
      d.statut,
      d.created_at,
      d.created_at as updated_at,
      d.created_by_email,
      d.user_id,
      sh.score_global as score
    FROM dossiers d
    LEFT JOIN LATERAL (
      SELECT score_global
      FROM scores_history
      WHERE enterprise_id = d.id
      ORDER BY created_at DESC
      LIMIT 1
    ) sh ON true
    WHERE d.deleted_at IS NULL
      AND (
        p_creator_filter = 'all'
        OR (p_creator_filter = 'mine' AND d.user_id = p_user_id)
        OR (p_creator_filter NOT IN ('all', 'mine') AND d.created_by_email = p_creator_filter)
      )
      AND (
        p_search IS NULL
        OR p_search = ''
        OR d.raison_sociale ILIKE '%' || p_search || '%'
        OR d.siren ILIKE '%' || p_search || '%'
      )
      AND (p_status IS NULL OR p_status = '' OR d.statut = p_status::statut_dossier)
      AND (
        p_score_zone IS NULL
        OR p_score_zone = ''
        OR (p_score_zone = 'danger' AND sh.score_global IS NOT NULL AND sh.score_global < 4)
        OR (p_score_zone = 'warning' AND sh.score_global IS NOT NULL AND sh.score_global >= 4 AND sh.score_global < 6)
        OR (p_score_zone = 'caution' AND sh.score_global IS NOT NULL AND sh.score_global >= 6 AND sh.score_global < 8)
        OR (p_score_zone = 'success' AND sh.score_global IS NOT NULL AND sh.score_global >= 8)
        OR (p_score_zone = 'none' AND sh.score_global IS NULL)
      )
    ORDER BY
      CASE WHEN p_sort = 'created_desc' OR p_sort = 'updated_desc' THEN d.created_at END DESC NULLS LAST,
      CASE WHEN p_sort = 'created_asc' OR p_sort = 'updated_asc' THEN d.created_at END ASC NULLS LAST,
      CASE WHEN p_sort = 'name_asc' THEN LOWER(d.raison_sociale) END ASC NULLS LAST,
      CASE WHEN p_sort = 'name_desc' THEN LOWER(d.raison_sociale) END DESC NULLS LAST,
      CASE WHEN p_sort = 'score_desc' THEN sh.score_global END DESC NULLS LAST,
      CASE WHEN p_sort = 'score_asc' THEN sh.score_global END ASC NULLS LAST,
      d.created_at DESC NULLS LAST
    LIMIT p_per_page
    OFFSET v_offset
  ) enterprises_data;

  RETURN json_build_object(
    'data', COALESCE(v_enterprises, '[]'::json),
    'pagination', json_build_object(
      'page', p_page,
      'perPage', p_per_page,
      'total', v_total,
      'totalPages', v_total_pages
    )
  );
END;
$func$;

GRANT EXECUTE ON FUNCTION get_enterprises_paginated(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_enterprises_paginated IS 'Liste paginee des entreprises avec recherche, tri et filtres.';
