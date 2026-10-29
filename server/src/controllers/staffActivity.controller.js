import { StaffError } from "../services/staff.service.js";
import { getStaffActivity, revertClaim, addPassNote } from "../services/staffActivity.service.js";
import {
  staffIdParamSchema,
  passIdParamSchema,
  activityQuerySchema,
  revertSchema,
  addNoteSchema,
} from "../validators/staffActivity.validator.js";

const fail = (res, error, fallback) => {
  if (error instanceof StaffError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  console.error(fallback, error);

  return res.status(500).json({ success: false, message: fallback });
};

const invalid = (res, parsed) =>
  res.status(400).json({
    success: false,
    message: parsed.error.issues[0]?.message || "Invalid request",
  });

/** GET /api/admin/staff/:irisId/activity?category=&action=&page=&q= */
export const staffActivityController = async (req, res) => {
  const id = staffIdParamSchema.safeParse(req.params);
  if (!id.success) return invalid(res, id);

  const query = activityQuerySchema.safeParse(req.query);
  if (!query.success) return invalid(res, query);

  try {
    const result = await getStaffActivity(id.data.irisId, query.data);

    return res.json({ success: true, ...result });
  } catch (error) {
    return fail(res, error, "Failed to fetch staff activity");
  }
};

/** POST /api/admin/passes/:passId/revert   body: { reason? } */
export const revertClaimController = async (req, res) => {
  const id = passIdParamSchema.safeParse(req.params);
  if (!id.success) return invalid(res, id);

  const parsed = revertSchema.safeParse(req.body ?? {});
  if (!parsed.success) return invalid(res, parsed);

  try {
    const item = await revertClaim(id.data.passId, parsed.data.reason);

    console.log(`Claim reverted from the staff admin page: ${id.data.passId}${parsed.data.reason ? " (reason given)" : ""}`);

    return res.json({ success: true, item });
  } catch (error) {
    return fail(res, error, "Failed to revert the claim");
  }
};

/** POST /api/admin/passes/:passId/notes   body: { note, kind? } */
export const addNoteController = async (req, res) => {
  const id = passIdParamSchema.safeParse(req.params);
  if (!id.success) return invalid(res, id);

  const parsed = addNoteSchema.safeParse(req.body ?? {});
  if (!parsed.success) return invalid(res, parsed);

  try {
    const note = await addPassNote(id.data.passId, parsed.data);

    return res.status(201).json({ success: true, note });
  } catch (error) {
    return fail(res, error, "Failed to save the note");
  }
};
