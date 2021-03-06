import generate from "./generate";

const name = "slug";
const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;

/**
 * Human-readable identifier for access objects that can be retrieved directly
 * by users.
 */
export type Slug = string;

const format = generate<Slug>(name, regex);
export const schema = format.schema;
