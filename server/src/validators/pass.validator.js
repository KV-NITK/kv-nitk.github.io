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

export const scanPassSchema = z.object({
  token: z
    .string({ required_error: "Token is required" })
    .trim()
    .uuid("Invalid token format"),
});
