import { z } from "zod";

const rollNo = z
  .string()
  .trim()
  .toUpperCase();
  

const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Member name is required")
    .max(100, "Member name is too long"),

  rollNo,

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
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
    .min(
      2,
      "At least 2 additional members are required (team size must be at least 3 including leader)"
    )
    .max(
      3,
      "At most 3 additional members are allowed (team size cannot exceed 4 including leader)"
    ),
});