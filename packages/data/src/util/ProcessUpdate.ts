import { z } from "zod";

import { Timestamp } from "./Timestamp.js";

/**
 * Schema for a ProcessUpdate that has not yet yielded a result.
 */
const ProcessRequest = z
  .object({
    /**
     * Most recent request time for the automated process to run.
     */
    requestDate: Timestamp,
  })
  .strict();

/**
 * Additional schema for a ProcessUpdate after it has yielded a result.
 */
const ProcessResult = z
  .object({
    /**
     * Most recent time the process update took place.
     */
    processDate: Timestamp,

    /**
     * Whether the last process was run successfully on this object.
     */
    succeeded: z.boolean(),
    /**
     * Error message supplied by the process.
     */
    message: z.string(),
  })
  .strict();

/**
 * An object that describes a request for and the output of an automated
 * process that is applied to the parent object.
 */
export const ProcessUpdate = z.union([
  ProcessRequest,
  ProcessRequest.merge(ProcessResult),
]);

export type ProcessUpdate = z.infer<typeof ProcessUpdate>;
