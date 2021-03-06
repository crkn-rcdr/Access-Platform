import { generate as generateFormat } from "../Format";

const name = "slug";
const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;

/**
 * Human-readable identifier for access objects that can be retrieved directly
 * by users.
 */
type Slug = string;
export default Slug;

export const format = generateFormat<Slug>(name, regex);
