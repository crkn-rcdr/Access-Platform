import { z } from "zod";

/**
 * Someone who can edit content on the platform.
 */
export const User = z
  .object({
    /**
     * The user's name.
     */
    name: z.string().min(1),
    /**
     * The user's email.
     */
    email: z.string().email(),
  })
  .strict();

export type User = z.infer<typeof User>;
