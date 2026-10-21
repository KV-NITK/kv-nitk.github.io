import { z } from "zod";

// A batch of flower taps from one page, sent every few seconds. `client` is
// a random id the page makes once, so one visitor's taps can be capped
// without a login.
export const flowersSchema = z.object({
  count: z.number().int().min(1).max(50),
  client: z.string().trim().regex(/^[A-Za-z0-9-]{8,64}$/, "Invalid client id"),
});

export const playIdSchema = z.string().uuid("Invalid game id");

// A new game, with the ids of this browser's earlier games so it can deal
// other films. Ids that don't parse are just ignored.
export const startSchema = z.object({
  previous: z
    .array(z.unknown())
    .max(30)
    .catch([])
    .transform((ids) => ids.filter((id) => playIdSchema.safeParse(id).success)),
});

export const guessSchema = z.object({
  guess: z.string().trim().min(1, "Write a film name").max(60),
});

export const nameSchema = z.object({
  name: z.string().max(100),
});
