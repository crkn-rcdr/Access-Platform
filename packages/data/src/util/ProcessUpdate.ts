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
export const FailedProcessResult = ProcessRequest.merge(
  z.object({
    /**
     * Most recent time the process update took place.
     */
    processDate: Timestamp,

    /**
     * Whether the last process was run successfully on this object.
     */
    succeeded: z.literal(false),

    /**
     * Error message supplied by the process.
     */
    message: z.string(),
  })
).strict();

export type FailedProcessResult = z.infer<typeof FailedProcessResult>;

/**
 * The result of a background process.
 */
export const SucceededProcessResult = ProcessRequest.merge(
  z.object({
    /**
     * Most recent time the process update took place.
     */
    processDate: Timestamp,

    /**
     * Whether the last process was run successfully on this object.
     */
    succeeded: z.literal(true),

    /**
     * Error message supplied by the process.
     */
    message: z.string(),
  })
).strict();

export type SucceededProcessResult = z.infer<typeof SucceededProcessResult>;

/**
 * An object that describes a request for and the output of an automated
 * process that is applied to the parent object.
 */
export const ProcessResult = z.union([
  SucceededProcessResult,
  FailedProcessResult,
]);

export type ProcessResult = z.infer<typeof ProcessResult>;

/**
 * The result of a background smelter process.
 */
export const SmeltProcess = z.object({
  /**
   * Most recent request time for the automated process to run.
   */
  requestDate: Timestamp.optional(),

  /**
   * Most recent time the process update took place.
   */
  processDate: Timestamp.optional(),

  /**
   * Whether the last process was run successfully on this object.
   */
  succeeded: z.boolean().optional(),

  /**
   * Error message supplied by the process.
   */
  message: z.string().optional(),
});

export type SmeltProcess = z.infer<typeof SmeltProcess>;

/**
 * An object that describes a request for and the output of an automated
 * process that is applied to the parent object.
 */
export const FailedProcessUpdate = z.union([
  ProcessRequest,
  FailedProcessResult,
]);

export type FailedProcessUpdate = z.infer<typeof FailedProcessUpdate>;

/**
 * An object that describes a request for and the output of an automated
 * process that is applied to the parent object.
 */
export const SucceededProcessUpdate = z.union([
  ProcessRequest,
  SucceededProcessResult,
]);

export type SucceededProcessUpdate = z.infer<typeof SucceededProcessUpdate>;

/**
 * An object that describes a request for and the output of an automated
 * process that is applied to the parent object.
 */
export const ProcessUpdate = z.union([
  SucceededProcessUpdate,
  FailedProcessUpdate,
]);

export type ProcessUpdate = z.infer<typeof ProcessUpdate>;

/**
 * The result of a background OCR process.
 */
export const FailedOcrProcessResult = ProcessRequest.merge(
  z.object({
    /**
     * Most recent time the process update took place.
     */
    processDate: Timestamp,

    /**
     * Whether the last process was run successfully on this object.
     */
    succeeded: z.literal(false),

    /**
     * Error message supplied by the process.
     */
    message: z.string().optional(),
  })
).strict();

export type FailedOcrProcessResult = z.infer<typeof FailedOcrProcessResult>;

/**
 * The result of a background OCR process.
 */
export const SucceededOcrProcessResult = ProcessRequest.merge(
  z.object({
    /**
     * Most recent time the process update took place.
     */
    processDate: Timestamp,

    /**
     * Whether the last process was run successfully on this object.
     */
    succeeded: z.literal(true),

    /**
     * Error message supplied by the process.
     */
    message: z.string().optional(),
  })
).strict();

export type SucceededOcrProcessResult = z.infer<
  typeof SucceededOcrProcessResult
>;
