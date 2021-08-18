import { z } from "zod";

import { CouchAttachmentRecord } from "../util/CouchAttachmentRecord.js";
import { ProcessRequest, ProcessResult } from "../util/ProcessUpdate.js";
import { Slug } from "../util/Slug.js";
import { Timestamp } from "../util/Timestamp.js";
import { User } from "../util/User.js";

import { DMDFORMATS, DMDOUTPUTS } from "./types.js";

/**
 * The result of attempting to parse an individual metadata
 * record, after it has been split from the task's file.
 */
const ParseRecord = z
  .object({
    /**
     * Whether this record's metadata has been parsed successfully.
     */
    parsed: z.boolean(),

    /**
     * The type of output parsed for this record. Required when the record's
     * metadata has been parsed successfully.
     */
    output: z.enum(DMDOUTPUTS).optional(),

    /**
     * The id extracted for this record. When the record's metadata has been
     * parsed successfully, this must be provided.
     */
    id: Slug.optional(),

    /**
     * The label extracted for this record. Also required for a successfully
     * parsed record.
     */
    label: z.string().optional(),

    /**
     * Any message returned by the metadata processor.
     */
    message: z.string().optional(),
  })
  .refine(
    (record) => !record.parsed || (record.id && record.output && record.label),
    "A successfully parsed record must provide: output, id, label"
  );

export type ParseRecord = z.infer<typeof ParseRecord>;

/**
 * DMDTask awaiting processing.
 */
export const WaitingDMDTask = z.object({
  /**
   * Unique ID assigned to the task.
   */
  id: z.string(),

  /**
   * CouchDB `_attachments` object.
   */
  attachments: CouchAttachmentRecord,

  /**
   * Record of the user who created this task.
   */
  user: User,

  /**
   * Specified format of the attached descriptive metadata file.
   */
  format: z.enum(DMDFORMATS),

  /**
   * The request to split, validate, and flatten the metadata in the attached file.
   */
  process: ProcessRequest,

  /**
   * Timestamp of the task's most recent update.
   */
  updated: Timestamp,
});

export type WaitingDMDTask = z.infer<typeof WaitingDMDTask>;

/**
 * DMDTask whose metadata file could not be processed into individual records.
 */
export const FailedDMDTask = WaitingDMDTask.merge(
  z.object({
    /**
     * The request has been processed.
     */
    process: ProcessResult,
  })
);

export type FailedDMDTask = z.infer<typeof FailedDMDTask>;

/**
 * DMDTask whose metadata file could be processed into individual records.
 */
export const SucceededDMDTask = FailedDMDTask.merge(
  z.object({
    /**
     * List of individual items found in the metadata file.
     * Successfully parsed records will be attached to the document,
     * referenceable by the record's index in this array.
     */
    items: z.array(ParseRecord),
  })
);

export type SucceededDMDTask = z.infer<typeof SucceededDMDTask>;

/**
 * A descriptive metadata task (DMDTask) can be in three states:
 *
 * 1. Waiting for background processing to complete (WaitingDMDTask). An uploaded metadata file in a format hopefully matching `mdType` has been attached to the task.
 * 2. Reporting that background processing could not split or validate the metadata file (FailedDMDTask).
 * 3. Reporting that background processing could split or validate the metadata file. The processor attempted to parse each individual item it extracted from the file; those items that parsed successfully have their own attachments added to the document.
 */
export const DMDTask = z.union([
  WaitingDMDTask,
  FailedDMDTask,
  SucceededDMDTask,
]);

export type DMDTask = z.infer<typeof DMDTask>;
