import { z } from "zod";

const irisIdSchema = z
  .string({ error: "IRIS ID is required" })
  .trim()
  .regex(/^\d{7}$/, "IRIS ID must be exactly 7 digits");

const roleSchema = z.enum(["VOLUNTEER", "ADMIN"], {
  error: "Role must be VOLUNTEER or ADMIN",
});

const nameSchema = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(80, "Name is too long");

export const addStaffSchema = z.object({
  irisId: irisIdSchema,
  name: nameSchema,
  role: roleSchema,
  active: z.boolean().default(true),
});

export const staffIdParamSchema = z.object({ irisId: irisIdSchema });

export const updateStaffSchema = z
  .object({
    name: nameSchema.optional(),
    role: roleSchema.optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => v.name !== undefined || v.role !== undefined || v.active !== undefined, {
    message: "Nothing to change",
  });
