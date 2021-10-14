import { z } from "zod";

const isoRegex =
  /^\d{4}-(?:0\d|1[0-2])-(?:[0-2]\d|3[0-1])T[0-2]\d:[0-5]\d:(?:[0-5]\d|60)Z$/;

/**
 * An ISO 6801 timestamp akin to JSON Schema's `date-time`, but only accepts
 * times in UTC. Note that decimal places after the number of seconds are not
 * allowed.
 */
export const StringTimestamp = z.string().regex(isoRegex, "Invalid Timestamp");

/**
 * Either: Number of seconds after the Unix epoch
 *
 * or
 *
 * StringTimestamp
 */
export const Timestamp = z.union([z.number(), StringTimestamp]);
export type Timestamp = z.infer<typeof Timestamp>;

/**
 * Returns a JavaScript Date object from a timestamp.
 */
export const parseTimestamp = (timestamp: Timestamp): Date => {
  if (typeof timestamp === "number") return new Date(timestamp * 1000);
  // if parsing fails, e.g. if date is undefined, date === NaN
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? new Date(0) : new Date(parsed);
};
