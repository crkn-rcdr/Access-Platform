import { z } from "zod";

/**
 * The Noid alphanumeric character class.
 */
const nc = "[0-9bcdfghjkmnpqrstvwxz]";

const regex = new RegExp(
  `^69429\\/[gcms]\\d+${nc}{2}\\d${nc}{2}\\d${nc}{2}\\d${nc}$`
);

/**
 * Fully specified ark/noid combination for use as a permanent identifier
 * for an access object
 */
export const Noid = z.string().regex(regex, "Invalid Noid");
export type Noid = z.infer<typeof Noid>;
