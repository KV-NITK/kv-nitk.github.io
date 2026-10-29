import { listStaff, addStaff, updateStaff, StaffError } from "../services/staff.service.js";
import {
  addStaffSchema,
  staffIdParamSchema,
  updateStaffSchema,
} from "../validators/staff.validator.js";

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

/** GET /api/admin/staff */
export const listStaffController = async (req, res) => {
  try {
    const result = await listStaff();

    return res.json({ success: true, ...result });
  } catch (error) {
    return fail(res, error, "Failed to fetch staff");
  }
};

/** POST /api/admin/staff */
export const addStaffController = async (req, res) => {
  const parsed = addStaffSchema.safeParse(req.body);

  if (!parsed.success) return invalid(res, parsed);

  try {
    const staff = await addStaff(parsed.data);

    console.log(`Staff added: ${staff.irisId} as ${staff.role}`);

    return res.status(201).json({ success: true, staff });
  } catch (error) {
    return fail(res, error, "Failed to add staff member");
  }
};

/** PATCH /api/admin/staff/:irisId */
export const updateStaffController = async (req, res) => {
  const id = staffIdParamSchema.safeParse(req.params);

  if (!id.success) return invalid(res, id);

  const parsed = updateStaffSchema.safeParse(req.body);

  if (!parsed.success) return invalid(res, parsed);

  try {
    const staff = await updateStaff(id.data.irisId, parsed.data);

    console.log(`Staff updated: ${staff.irisId} ->`, JSON.stringify(parsed.data));

    return res.json({ success: true, staff });
  } catch (error) {
    return fail(res, error, "Failed to update staff member");
  }
};
