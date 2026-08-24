import { z } from "zod";

const nitkEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .refine(
    (email) => email.endsWith("@nitk.edu.in"),
    "Only NITK email addresses are allowed"
  );

const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Member name is required")
    .max(100, "Member name is too long"),

  email: nitkEmail,
});

export const registerTeamSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(2, "Team name is required")
    .max(50, "Team name is too long"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),

  members: z
    .array(memberSchema)
    .min(1, "At least one member is required"),
});