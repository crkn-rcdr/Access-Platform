import { generateFormat } from "../validator";

const name = "slug";
const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;

/**
 * Human-readable identifier for access objects that can be retrieved directly
 * by users.
 */
export type Slug = string;

export const { schema, validate } = generateFormat<Slug>(name, regex);
