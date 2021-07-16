import { z } from "zod";

import { Timestamp } from "./Timestamp.js";

/**
 * A request to trigger a background process.
 */
export const ProcessRequest = z
  .object({
    /**
     * Most recent request time for the automated process to run.
     */
    requestDate: Timestamp,
  })
  .strict();

export type ProcessRequest = z.infer<typeof ProcessRequest>;

/**
 * The result of a background process.
 */
export const ProcessResult = ProcessRequest.merge(
  z.object({
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
).strict();

export type ProcessResult = z.infer<typeof ProcessResult>;

/**
 * An object that describes a request for and the output of an automated
 * process that is applied to the parent object.
 */
export const ProcessUpdate = z.union([ProcessRequest, ProcessResult]);

export type ProcessUpdate = z.infer<typeof ProcessUpdate>;
