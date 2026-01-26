-- =============================================
-- RPC: get_archives_paginated
-- Description: Liste paginée des archives avec recherche et tri
-- =============================================

CREATE OR REPLACE FUNCTION get_archives_paginated(
  p_user_id UUID,
  p_search TEXT DEFAULT NULL,
  p_sort TEXT DEFAULT 'deleted_desc',
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
  v_archives JSON;
BEGIN
  v_offset := (p_page - 1) * p_per_page;

  -- Count total with filters
  SELECT COUNT(*)
  INTO v_total
  FROM dossiers d
  WHERE d.deleted_at IS NOT NULL
    AND (
      p_search IS NULL
      OR p_search = ''
      OR d.raison_sociale ILIKE '%' || p_search || '%'
      OR d.siren ILIKE '%' || p_search || '%'
    );

  v_total_pages := GREATEST(1, CEIL(v_total::NUMERIC / p_per_page));

  -- Get archives with sort
  SELECT json_agg(row_to_json(archives_data))
  INTO v_archives
  FROM (
    SELECT
      d.id,
      d.siren,
      d.raison_sociale,
      d.deleted_at,
      d.deleted_by,
      d.created_by_email
    FROM dossiers d
    WHERE d.deleted_at IS NOT NULL
      AND (
        p_search IS NULL
        OR p_search = ''
        OR d.raison_sociale ILIKE '%' || p_search || '%'
        OR d.siren ILIKE '%' || p_search || '%'
      )
    ORDER BY
      CASE WHEN p_sort = 'deleted_desc' THEN d.deleted_at END DESC NULLS LAST,
      CASE WHEN p_sort = 'deleted_asc' THEN d.deleted_at END ASC NULLS LAST,
      CASE WHEN p_sort = 'name_asc' THEN LOWER(d.raison_sociale) END ASC NULLS LAST,
      CASE WHEN p_sort = 'name_desc' THEN LOWER(d.raison_sociale) END DESC NULLS LAST,
      d.deleted_at DESC NULLS LAST
    LIMIT p_per_page
    OFFSET v_offset
  ) archives_data;

  RETURN json_build_object(
    'data', COALESCE(v_archives, '[]'::json),
    'pagination', json_build_object(
      'page', p_page,
      'perPage', p_per_page,
      'total', v_total,
      'totalPages', v_total_pages
    )
  );
END;
$func$;

GRANT EXECUTE ON FUNCTION get_archives_paginated(UUID, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_archives_paginated IS 'Liste paginee des archives avec recherche et tri.';
