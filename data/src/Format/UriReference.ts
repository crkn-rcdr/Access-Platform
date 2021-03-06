import generate from "./generate";

const name = "uri-reference";
// See https://github.com/ajv-validator/ajv-formats/blob/master/src/formats.ts
const regex = /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i;

/**
 * A URI reference.
 */
export type UriReference = string;

const format = generate<UriReference>(name, regex);
export const schema = format.schema;
