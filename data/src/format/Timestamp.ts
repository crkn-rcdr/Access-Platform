import { generateFormat } from "../validator";

const name = "timestamp";
const regex = /^\d{4}-(?:0\d|1[0-2])-(?:[0-2]\d|3[0-1])t[0-2]\d:[0-5]\d:(?:[0-5]\d|60)(?:\.\d+)?z$/i;

/**
 * An ISO 6801 timestamp akin to JSON Schema's `date-time`, but only accepts
 * times in UTC. Note that decimal places after the number of seconds are
 * allowed.
 */
export type Timestamp = string;

export const { inline, schema, validate } = generateFormat<Timestamp>(
  name,
  regex
);
