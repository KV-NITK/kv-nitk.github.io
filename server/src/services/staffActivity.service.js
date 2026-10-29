import { supabase } from "../config/supabase.js";
import { StaffError } from "./staff.service.js";

export const ACTIVITY_PAGE_SIZE = 30;

// The staff_activity / admin_revert_event_pass functions or pass_notes table are missing:
// sql/007_staff_activity.sql has not been run on this database
const isMissingSetup = (error) =>
  ["42883", "42P01", "PGRST202", "PGRST205"].includes(error?.code) ||
  /does not exist|could not find/i.test(error?.message || "");

const NOT_SET_UP = "Staff activity is not set up yet. Run sql/007_staff_activity.sql on the database.";

const toActivity = (row) => ({
  eventId: row.event_id,
  action: row.event_action,
  category: row.event_category,
  at: row.event_at,
  passId: row.pass_id,
  itemName: row.item_name || "",
  size: row.variant || "",
  fit: row.fit || "",
  holderName: row.holder_name || "",
  holderIrisId: row.holder_iris_id || "",
  passStatus: row.pass_status || "",
  revertedAt: row.reverted_at || null,
  notes: Array.isArray(row.notes) ? row.notes : [],
  // Only the newest event on a pass that is still claimed can be reverted
  canRevert: row.event_action === "CLAIM" && row.is_latest === true && row.pass_status === "CLAIMED",
});

/** One staff member's claims and reverts, newest first, ACTIVITY_PAGE_SIZE at a time. `q` searches the holder. */
export const getStaffActivity = async (irisId, { category, action, page = 1, q }) => {
  const { data, error } = await supabase.rpc("staff_activity", {
    p_staff: irisId,
    p_category: category ?? null,
    p_action: action ?? null,
    p_limit: ACTIVITY_PAGE_SIZE,
    p_offset: (page - 1) * ACTIVITY_PAGE_SIZE,
    p_query: q ?? null,
  });

  if (error) {
    if (isMissingSetup(error)) throw new StaffError(503, NOT_SET_UP);

    console.error("Staff activity error:", error);
    throw new StaffError(500, "Failed to fetch staff activity");
  }

  const rows = data || [];

  return {
    activity: rows.map(toActivity),
    total: rows[0]?.total ?? 0,
    page,
    pageSize: ACTIVITY_PAGE_SIZE,
  };
};

/** Revert a claim from the staff admin page. `reason` is optional. */
export const revertClaim = async (passId, reason) => {
  const { data, error } = await supabase.rpc("admin_revert_event_pass", {
    p_id: passId,
    p_reason: reason ?? null,
  });

  if (error) {
    if (isMissingSetup(error)) throw new StaffError(503, NOT_SET_UP);

    console.error("Admin revert error:", error);
    throw new StaffError(500, "Failed to revert the claim");
  }

  if (data?.result === "REVERTED") return data.item;
  if (data?.result === "NOT_CLAIMED") throw new StaffError(409, "This pass is not claimed any more, nothing to revert.");

  throw new StaffError(data?.message === "Pass not found" ? 404 : 409, data?.message || "Could not revert this pass");
};

/** Add a note to a pass. Notes are never edited or deleted. */
export const addPassNote = async (passId, { note, kind }) => {
  const { data: pass, error: lookupError } = await supabase
    .from("claimable_items")
    .select("id")
    .eq("id", passId)
    .maybeSingle();

  if (lookupError) {
    console.error("Add note lookup error:", lookupError);
    throw new StaffError(500, "Failed to save the note");
  }

  if (!pass) throw new StaffError(404, "Pass not found");

  const { data, error } = await supabase
    .from("pass_notes")
    .insert({ pass_id: passId, kind, note })
    .select("id, kind, note, created_at")
    .single();

  if (error) {
    if (isMissingSetup(error)) throw new StaffError(503, NOT_SET_UP);

    console.error("Add note error:", error);
    throw new StaffError(500, "Failed to save the note");
  }

  return { id: data.id, kind: data.kind, note: data.note, createdAt: data.created_at };
};
