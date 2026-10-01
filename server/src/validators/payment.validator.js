import { z } from "zod";

export const createPaymentSchema = z.object({
  purpose: z
    .string()
    .trim()
    .min(1, "Payment purpose is required")
    .max(50, "Payment purpose is too long"),

  referenceId: z
    .string()
    .trim()
    .max(100, "Reference ID is too long")
    .optional()
    .nullable(),

  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),

  idempotencyKey: z
    .string()
    .trim()
    .max(128, "Idempotency key is too long")
    .optional()
    .nullable(),
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