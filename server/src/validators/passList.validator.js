import { z } from "zod";
import { passCategorySchema } from "./pass.validator.js";

// Left out, empty or blank all mean "not set"
const optionalText = (max, tooLong) =>
  z
    .string()
    .trim()
    .max(max, tooLong)
    .optional()
    .transform((value) => value || undefined);

export const listPassesSchema = z.object({
  category: passCategorySchema,
  status: z.enum(["ISSUED", "CLAIMED"], { error: "Status must be ISSUED or CLAIMED" }),
  fit: optionalText(30, "Fit is too long"),
  size: optionalText(10, "Size is too long"),
  // One character is enough
  q: optionalText(40, "Search is too long"),
  page: z.coerce.number({ error: "Page must be a number" }).int().min(1, "Page starts at 1").max(2000).default(1),
});
