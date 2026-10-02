import { z } from "zod";

const cartItemSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product is required")
    .max(100, "Product id is too long"),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity is too large"),
});

// The client never sends a price: only what it wants and an optional coupon.
const cartFields = {
  items: z
    .array(cartItemSchema)
    .min(1, "Cart is empty")
    .max(20, "Too many items in cart"),

  couponCode: z
    .string()
    .trim()
    .max(32, "Coupon code is too long")
    .optional()
    .nullable(),
};

export const quoteOrderSchema = z.object(cartFields);

export const createPaymentSchema = z.object({
  ...cartFields,

  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),

  idempotencyKey: z
    .string()
    .trim()
    .min(1, "Idempotency key is required")
    .max(128, "Idempotency key is too long"),
});

export const refundPaymentSchema = z.object({
  amount: z
    .number()
    .positive("Refund amount must be greater than 0"),

  reason: z
    .string()
    .trim()
    .max(255, "Refund reason is too long")
    .optional(),

  idempotencyKey: z
    .string()
    .trim()
    .max(128, "Idempotency key is too long")
    .optional(),
});