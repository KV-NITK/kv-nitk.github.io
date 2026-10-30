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
  photoClaims: stats?.photo_claims ?? 0,
  reverts: stats?.reverts ?? 0,
  lastActionAt: stats?.last_action_at ?? null,
});

/**
 * Everyone in event_staff, with their claim totals from pass_events. The totals
 * are a bonus: if the pass_events migration has not run, the list still loads
 * and `statsAvailable` is false.
 */
export const listStaff = async () => {
  const [{ data: rows, error }, { data: stats, error: statsError }] = await Promise.all([
    supabase.from("event_staff").select(STAFF_COLUMNS).order("created_at", { ascending: false }),
    supabase.rpc("staff_claim_stats"),
  ]);

  if (error) {
    console.error("List staff error:", error);
    throw new StaffError(500, "Failed to fetch staff");
  }

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

export const updateStaff = async (irisId, changes) => {
  const patch = {};
  if (changes.name !== undefined) patch.name = changes.name;
  if (changes.role !== undefined) patch.role = changes.role;
  if (changes.active !== undefined) patch.active = changes.active;

  const { data, error } = await supabase
    .from("event_staff")
    .update(patch)
    .eq("iris_id", irisId)
    .select(STAFF_COLUMNS)
    .maybeSingle();

  if (error) {
    // Raised by the keep_an_active_admin trigger (sql/006_pass_events.sql)
    if (error.message === "LAST_ACTIVE_ADMIN") {
      throw new StaffError(409, "This is the last active admin. Make another admin first.");
    }

    console.error("Update staff error:", error);
    throw new StaffError(500, "Failed to update staff member");
  }

  if (!data) {
    throw new StaffError(404, "Staff member not found");
  }

  // The scanner caches staff for a few minutes; drop this one so the change is immediate
  clearStaffCache(irisId);

  return toStaff(data);
};
