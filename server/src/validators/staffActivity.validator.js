import { z } from "zod";

export { staffIdParamSchema } from "./staff.validator.js";

export const passIdParamSchema = z.object({
  passId: z.string({ error: "Pass id is required" }).trim().uuid("Invalid pass id"),
});

export const activityQuerySchema = z.object({
  category: z.enum(["FOOD", "MERCH", "PHOTO"], { error: "Category must be FOOD, MERCH or PHOTO" }).optional(),
  action: z.enum(["CLAIM", "REVERT"], { error: "Action must be CLAIM or REVERT" }).optional(),
  page: z.coerce.number({ error: "Page must be a number" }).int().min(1, "Page starts at 1").max(1000).default(1),
  // Holder's name or IRIS id; empty means no search
  q: z
    .string()
    .trim()
    .max(60, "Search is too long")
    .optional()
    .transform((value) => value || undefined),
});

const noteText = z
  .string({ error: "Note is required" })
  .trim()
  .min(1, "Note is required")
  .max(500, "Note is too long (500 characters at most)");

// The reason is optional: left out, empty or blank all mean "no reason given"
export const revertSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(500, "Reason is too long (500 characters at most)")
    .optional()
    .transform((value) => value || undefined),
});

export const addNoteSchema = z.object({
  note: noteText,
  kind: z.enum(["NOTE", "MISHANDLED"], { error: "Kind must be NOTE or MISHANDLED" }).default("NOTE"),
});
