import { z } from "zod";

const isoRegex =
  /^\d{4}-(?:0\d|1[0-2])-(?:[0-2]\d|3[0-1])T[0-2]\d:[0-5]\d:(?:[0-5]\d|60)Z$/;

/**
 * Either: Number of seconds after the Unix epoch
 *
 * or
 *
 * An ISO 6801 timestamp akin to JSON Schema's `date-time`, but only accepts
 * times in UTC. Note that decimal places after the number of seconds are not
 * allowed.
 */
export const Timestamp = z.union([
  z.number(),
  z.string().regex(isoRegex, "Invalid Timestamp"),
]);
export type Timestamp = z.infer<typeof Timestamp>;
