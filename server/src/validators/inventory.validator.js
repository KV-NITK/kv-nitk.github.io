import { z } from "zod";

// A payment_products id, e.g. tshirt-b-m. The database checks it is a merch product.
const productIdSchema = z
  .string({ error: "Product is required" })
  .trim()
  .regex(/^[a-z0-9-]{1,40}$/, "Unknown product");

export const setStockSchema = z.object({
  items: z
    .array(
      z.object({
        productId: productIdSchema,
        stock: z.number({ error: "Stock must be a number" }).int("Stock must be a whole number").min(0, "Stock cannot be negative").max(100000, "Stock is too large"),
      }),
      { error: "Nothing to save" }
    )
    .min(1, "Nothing to save")
    .max(50, "Too many rows"),
});

export const spotSaleSchema = z.object({
  productId: productIdSchema,
  quantity: z.number({ error: "Quantity must be a number" }).int().min(1, "Quantity is at least 1").max(100, "Quantity is at most 100").default(1),
  // Optional: left out, empty or blank all mean no name
  studentName: z
    .string()
    .trim()
    .max(80, "Name is too long")
    .optional()
    .transform((value) => value || undefined),
});

export const spotSaleIdParamSchema = z.object({
  id: z.coerce.number({ error: "Invalid spot sale" }).int("Invalid spot sale").positive("Invalid spot sale"),
});
