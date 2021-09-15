import { z } from "zod";

//"2020-06-02T15:20:16Z",
///\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/
const isoRegex = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\dZ$/;

/**
 * An ISO 6801 timestamp akin to JSON Schema's `date-time`, but only accepts
 * times in UTC. Note that decimal places after the number of seconds are not
 * allowed.
 */
export const WipmetaTimestamp = z.string().regex(isoRegex, "Invalid Timestamp");
