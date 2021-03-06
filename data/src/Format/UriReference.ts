import { generateFormat } from "../validator";

const name = "uri-reference";
// See https://github.com/ajv-validator/ajv-formats/blob/master/src/formats.ts
const regex = /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i;

/**
 * A URI reference.
 */
export type UriReference = string;

export const { schema, validate } = generateFormat<UriReference>(name, regex);
