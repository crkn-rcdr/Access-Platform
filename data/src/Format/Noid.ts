import generate from "./generate";

/**
 * The Noid alphanumeric character class.
 */
const nc = "[0-9bcdfghjkmnpqrstvwxz]";

const name = "noid";
const regex = new RegExp(
  `^69429\\/[acms]\\d+${nc}{2}\\d${nc}{2}\\d${nc}{2}\\d${nc}$`
);

/**
 * Fully specified ark/noid combination for use as a permanent identifier
 * for an access object.
 */
export type Noid = string;

const format = generate<Noid>(name, regex);
export const schema = format.schema;
