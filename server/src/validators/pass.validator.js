import { z } from "zod";

export const MERCH_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const MERCH_COLORS = ["Black", "White"];

// Exact enum schema
export const sizeEnumSchema = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);

// Case-insensitive input schema that transforms to uppercase
export const merchSizeSchema = z
  .string()
  .trim()
  .transform((val) => val.toUpperCase())
  .pipe(sizeEnumSchema);

export const merchColorSchema = z.enum(["Black", "White"]);

export const passCategorySchema = z.enum(["FOOD", "MERCH", "PHOTO"], {
  errorMap: () => ({ message: "Category must be FOOD, MERCH or PHOTO" }),
});

export const scanPassSchema = z.object({
  token: z
    .string({ required_error: "Token is required" })
    .trim()
    .uuid("Invalid token format"),
  category: passCategorySchema,
});

export const searchPassesSchema = z.object({
  q: z
    .string({ required_error: "Name or reg / roll number is required" })
    .trim()
    .min(3, "Enter at least 3 characters")
    .max(40),
  category: passCategorySchema,
});

export const revertPassSchema = z.object({
  id: z.string({ required_error: "Pass id is required" }).trim().uuid("Invalid pass id"),
});
