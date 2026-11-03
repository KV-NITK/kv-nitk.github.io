-- ==========================================================
-- Pass lists for the scanner: who has collected, who is still to collect
--   * list_event_passes(): one page of a category's passes by status (pending / claimed),
--     optionally narrowed by fit, size and a name / reg no / phone search, with the
--     buyer's phone number and counts per fit and size for the filter chips
-- Additive only: one new read-only function. search_event_passes() and the claim /
-- revert functions are NOT changed. Safe to run more than once, and safe while
-- scanning is going on.
-- ==========================================================

-- p_status: 'ISSUED' (still to collect) or 'CLAIMED'
-- p_fit / p_size: exact fit and size (null = any)
-- p_query: any part of the student's name (every word typed, any order), reg no or phone.
--          One character is enough; blank = no search.
-- Order: claimed = newest claim first; pending = by name.
-- Returns { passes, total, facets }
--   total:  passes matching status, fit, size and search
--   facets: counts per fit and size for status and search only (not fit/size), for the chips

CREATE OR REPLACE FUNCTION list_event_passes(
    p_category TEXT,
    p_status TEXT,
    p_fit TEXT DEFAULT NULL,
    p_size TEXT DEFAULT NULL,
    p_query TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 25,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH base AS (
        SELECT c.id, c.token, c.user_iris_id, c.user_name, c.category, c.item_name,
               c.variant, c.fit, c.item_index, c.status, c.claimed_at, c.claimed_by,
               COALESCE(s.name, c.claimed_by) AS claimed_by_name, c.created_at,
               p.customer_phone AS phone
        FROM claimable_items c
        LEFT JOIN event_staff s ON s.iris_id = c.claimed_by
        LEFT JOIN payments p ON p.id = c.payment_id
        WHERE c.category = p_category
          AND c.status IN ('ISSUED', 'CLAIMED')
          AND c.status = p_status
          AND (
              p_query IS NULL OR TRIM(p_query) = ''
              OR UPPER(c.user_iris_id) LIKE '%' || UPPER(replace(replace(replace(TRIM(p_query), '\', '\\'), '%', '\%'), '_', '\_')) || '%'
              OR p.customer_phone LIKE '%' || replace(replace(replace(TRIM(p_query), '\', '\\'), '%', '\%'), '_', '\_') || '%'
              OR (
                  c.user_name IS NOT NULL
                  AND NOT EXISTS (
                      SELECT 1
                      FROM unnest(string_to_array(TRIM(p_query), ' ')) AS w
                      WHERE w <> ''
                        AND c.user_name NOT ILIKE '%' || replace(replace(replace(w, '\', '\\'), '%', '\%'), '_', '\_') || '%'
                  )
              )
          )
    ),
    filtered AS (
        SELECT * FROM base
        WHERE (p_fit IS NULL OR fit = p_fit)
          AND (p_size IS NULL OR variant = p_size)
    ),
    page AS (
        SELECT f.*,
               ROW_NUMBER() OVER (
                   ORDER BY
                       (CASE WHEN p_status = 'CLAIMED' THEN f.claimed_at END) DESC NULLS LAST,
                       (CASE WHEN p_status <> 'CLAIMED' THEN LOWER(COALESCE(f.user_name, '')) END),
                       f.created_at, f.item_index, f.id
               ) AS rn
        FROM filtered f
        ORDER BY rn
        LIMIT LEAST(GREATEST(p_limit, 1), 100)
        OFFSET GREATEST(p_offset, 0)
    )
    SELECT jsonb_build_object(
        'passes', COALESCE((SELECT jsonb_agg(to_jsonb(page) - 'rn' ORDER BY page.rn) FROM page), '[]'::jsonb),
        'total', (SELECT COUNT(*) FROM filtered),
        'facets', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('fit', b.fit, 'size', b.variant, 'count', b.n))
            FROM (SELECT fit, variant, COUNT(*)::INTEGER AS n FROM base GROUP BY fit, variant) b
        ), '[]'::jsonb)
    );
$$;

REVOKE ALL ON FUNCTION list_event_passes(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION list_event_passes(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER) TO service_role;
