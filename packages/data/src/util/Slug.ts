import { z } from "zod";

const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;

/**
 * Human-readable identifier for access objects that can be retrieved directly
 * by users.
 */
export const Slug = z.string().regex(regex, "Invalid Slug");
export type Slug = z.infer<typeof Slug>;
