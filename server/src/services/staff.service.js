import { supabase } from "../config/supabase.js";
import { clearStaffCache } from "../middleware/staff.middleware.js";

// An error the controller turns into an HTTP status
export class StaffError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const STAFF_COLUMNS = "iris_id, name, role, active, created_at";

const toStaff = (row, stats) => ({
  irisId: row.iris_id,
  name: row.name || "",
  role: row.role,
  active: row.active,
  createdAt: row.created_at,
  foodClaims: stats?.food_claims ?? 0,
  merchClaims: stats?.merch_claims ?? 0,
  reverts: stats?.reverts ?? 0,
  lastActionAt: stats?.last_action_at ?? null,
});

/**
 * Everyone in event_staff, with their claim totals from pass_events. The totals
 * are a bonus: if the pass_events migration has not run, the list still loads
 * and `statsAvailable` is false.
 */
export const listStaff = async () => {
  const { data: rows, error } = await supabase
    .from("event_staff")
    .select(STAFF_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("List staff error:", error);
    throw new StaffError(500, "Failed to fetch staff");
  }

  const { data: stats, error: statsError } = await supabase.rpc("staff_claim_stats");

  if (statsError) {
    console.error("Staff claim stats error:", statsError);
  }

  const byStaff = new Map((statsError ? [] : stats || []).map((s) => [s.staff_iris_id, s]));

  return {
    staff: (rows || []).map((row) => toStaff(row, byStaff.get(row.iris_id))),
    statsAvailable: !statsError,
  };
};

export const addStaff = async ({ irisId, name, role, active }) => {
  const { data: existing, error: lookupError } = await supabase
    .from("event_staff")
    .select("iris_id")
    .eq("iris_id", irisId)
    .maybeSingle();

  if (lookupError) {
    console.error("Add staff lookup error:", lookupError);
    throw new StaffError(500, "Failed to add staff member");
  }

  if (existing) {
    throw new StaffError(409, "This IRIS ID is already on the staff list");
  }

  // created_at is left to the database default (now)
  const { data, error } = await supabase
    .from("event_staff")
    .insert({ iris_id: irisId, name, role, active })
    .select(STAFF_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new StaffError(409, "This IRIS ID is already on the staff list");
    }

    console.error("Add staff error:", error);
    throw new StaffError(500, "Failed to add staff member");
  }

  clearStaffCache(irisId);

  return toStaff(data);
};

// True when `irisId` is the only active admin, so removing their power would lock everyone out of reverting
const isLastActiveAdmin = async (irisId) => {
  const { data, error } = await supabase
    .from("event_staff")
    .select("iris_id")
    .eq("role", "ADMIN")
    .eq("active", true);

  if (error) {
    console.error("Active admin lookup error:", error);
    throw new StaffError(500, "Failed to update staff member");
  }

  return (data || []).every((row) => row.iris_id === irisId);
};

export const updateStaff = async (irisId, changes) => {
  const { data: current, error: lookupError } = await supabase
    .from("event_staff")
    .select(STAFF_COLUMNS)
    .eq("iris_id", irisId)
    .maybeSingle();

  if (lookupError) {
    console.error("Update staff lookup error:", lookupError);
    throw new StaffError(500, "Failed to update staff member");
  }

  if (!current) {
    throw new StaffError(404, "Staff member not found");
  }

  const losesAdmin =
    current.role === "ADMIN" &&
    current.active &&
    (changes.role === "VOLUNTEER" || changes.active === false);

  if (losesAdmin && (await isLastActiveAdmin(irisId))) {
    throw new StaffError(409, "This is the last active admin. Make another admin first.");
  }

  const patch = {};
  if (changes.name !== undefined) patch.name = changes.name;
  if (changes.role !== undefined) patch.role = changes.role;
  if (changes.active !== undefined) patch.active = changes.active;

  const { data, error } = await supabase
    .from("event_staff")
    .update(patch)
    .eq("iris_id", irisId)
    .select(STAFF_COLUMNS)
    .single();

  if (error) {
    console.error("Update staff error:", error);
    throw new StaffError(500, "Failed to update staff member");
  }

  // The scanner caches staff for a few minutes; drop this one so the change is immediate
  clearStaffCache(irisId);

  return toStaff(data);
};
