import { generate as generateFormat } from "../Format";

const name = "uri-reference";
// See https://github.com/ajv-validator/ajv-formats/blob/master/src/formats.ts
const regex = /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i;

/**
 * A URI reference.
 */
type UriReference = string;
export default UriReference;

export const format = generateFormat<UriReference>(name, regex);
