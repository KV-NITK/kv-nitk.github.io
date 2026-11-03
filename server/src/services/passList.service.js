import { supabase } from "../config/supabase.js";

export const PASS_LIST_PAGE_SIZE = 25;

// An error the controller turns into an HTTP status
export class PassListError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// sql/013_pass_lists.sql has not been run on this database
const isMissingSetup = (error) =>
  ["42883", "PGRST202"].includes(error?.code) || /does not exist|could not find/i.test(error?.message || "");

// The buyer's number as typed at checkout: 10 digits, shown without anything else
const cleanPhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  return digits.length > 10 ? digits.slice(-10) : digits;
};

const toPass = (row) => ({
  id: row.id,
  token: row.token,
  user_iris_id: row.user_iris_id,
  user_name: row.user_name,
  category: row.category,
  item_name: row.item_name,
  variant: row.variant,
  fit: row.fit,
  item_index: row.item_index,
  status: row.status,
  claimed_at: row.claimed_at,
  claimed_by: row.claimed_by,
  claimed_by_name: row.claimed_by_name,
  phone: cleanPhone(row.phone) || null,
});

/**
 * One page of a category's passes by status (ISSUED = still to collect, CLAIMED),
 * narrowed by fit, size and a search of the student's name / reg no / phone.
 */
export const listPasses = async ({ category, status, fit, size, q, page = 1 }) => {
  const { data, error } = await supabase.rpc("list_event_passes", {
    p_category: category,
    p_status: status,
    p_fit: fit ?? null,
    p_size: size ?? null,
    p_query: q ?? null,
    p_limit: PASS_LIST_PAGE_SIZE,
    p_offset: (page - 1) * PASS_LIST_PAGE_SIZE,
  });

  if (error) {
    if (isMissingSetup(error)) {
      throw new PassListError(503, "The pass list is not set up yet. Run sql/013_pass_lists.sql on the database.");
    }

    console.error("list_event_passes error:", error);
    throw new PassListError(500, "Failed to load the pass list");
  }

  return {
    passes: Array.isArray(data?.passes) ? data.passes.map(toPass) : [],
    total: Number(data?.total) || 0,
    facets: Array.isArray(data?.facets)
      ? data.facets.map((f) => ({ fit: f.fit || "", size: f.size || "", count: Number(f.count) || 0 }))
      : [],
    page,
    pageSize: PASS_LIST_PAGE_SIZE,
  };
};
