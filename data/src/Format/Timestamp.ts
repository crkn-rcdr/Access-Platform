import { generateFormat } from "../validator";

/**
 * This is `date-time`, according to the JSON Schema spec.
 */
const name = "timestamp";
// See https://github.com/ajv-validator/ajv-formats/blob/master/src/formats.ts
const regex = /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i;

/**
 * An ISO 8601 timestamp.
 */
export type Timestamp = string;

export const { schema, validate } = generateFormat<Timestamp>(name, regex);
