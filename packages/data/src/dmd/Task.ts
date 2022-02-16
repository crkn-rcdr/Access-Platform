import { z } from "zod";

import { CouchAttachmentRecord } from "../util/CouchAttachmentRecord.js";
import {
  ProcessRequest,
  ProcessResult,
  SucceededProcessResult,
  FailedProcessResult,
} from "../util/ProcessUpdate.js";
//import { Slug } from "../util/Slug.js";
import { Timestamp } from "../util/Timestamp.js";
import { User } from "../util/User.js";

import { DMDFORMATS, DMDOUTPUTS } from "./types.js";

/**
 * The result of attempting to parse an individual metadata
 * record, after it has been split from the task's file.
 */
const ParseRecord = z.object({
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
  id: z.string().optional(), //Slug

  /**
   * The label extracted for this record. Also required for a successfully
   * parsed record.
   */
  label: z.string().optional(),

  /**
   * Any message returned by the metadata processor.
   */
  message: z.string().optional(),
});
export type ParseRecord = z.infer<typeof ParseRecord>;

/**
 * DMD Task is being added to the queue for storing each item's new metadata file.
 * (Process Metadata File Step: in-queue)
 */
export const QueuedParseRecord = ParseRecord.merge(
  z.object({
    /**
     * This field tells the metadata processor where to store the new metadata to.
     */
    destination: z.enum(["access", "preservation"]).optional(), // if not defined, then  not yet at the "Process Metadata File" stage.
  })
);

export type QueuedParseRecord = z.infer<typeof ParseRecord>;

/**
 * DMD Task is being added to the queue for storing each item's new metadata file.
 * (Process Metadata File Step: in-queue)
 */
export const StoredParseRecord = QueuedParseRecord.merge(
  z.object({
    /**
     * Whether this record's metadata has been stored successfully.
     */
    stored: z.boolean(), // not sure if we need this for a per-item status
  })
);

export type StoredParseRecord = z.infer<typeof StoredParseRecord>;

/**
 * DMDTask file is being uploaded to split, validate, and flatten the metadata in the attached file.
 * (Upload Attachment Step: waiting)
 */
export const ValidatingDMDTask = z.object({
  /**
   * Unique ID assigned to the task.
   */
  id: z.string(),

  /**
   * CouchDB `_attachments` object.
   */
  attachments: CouchAttachmentRecord.optional(),

  /**
   * Record of the user who created this task.
   */
  user: User,

  /**
   * Specified format of the attached descriptive metadata file.
   */
  format: z.enum(DMDFORMATS),

  /**
   * The original name of the attached descriptive metadata file.
   */
  fileName: z.string().optional(),

  /**
   * The request to split, validate, and flatten the metadata in the attached file.
   */
  process: ProcessRequest,

  /**
   * Timestamp of the task's most recent update.
   */
  updated: Timestamp,
});

export type ValidatingDMDTask = z.infer<typeof ValidatingDMDTask>;

/**
 * DMD Task is being added to the queue for storing each item's new metadata file.
 * (Process Metadata File Step: in-queue)
 */
export const ValidatedDMDTask = ValidatingDMDTask.merge(
  z.object({
    /**
     * The items in the file have had their metadata processed.
     */
    process: ProcessResult,
    /**
     * List of individual items found in the metadata file.
     * Successfully parsed records will be attached to the
     * document, by the record's index in this array.
     */
    items: z.array(ParseRecord),
  })
);

export type ValidatedDMDTask = z.infer<typeof ValidatedDMDTask>;

/**
 * DMD Task is being added to the queue for storing each item's new metadata file.
 * (Process Metadata File Step: in-queue)
 */
export const QueuedDMDTask = ValidatedDMDTask.merge(
  z.object({
    /**
     * The request to queue the items for storage.
     */
    process: ProcessRequest,

    /**
     * List of individual items found in the metadata file.
     */
    items: z.array(QueuedParseRecord),
  })
);

export type QueuedDMDTask = z.infer<typeof QueuedDMDTask>;

/**
 * DMDTask whose metadata file could not be processed into individual records.
 * (Final Results Step: fail)
 */
export const FailedDMDTask = QueuedDMDTask.merge(
  z.object({
    /**
     * The items in the file have not had their metadata stored
     */
    process: FailedProcessResult,

    /**
     * List of individual items found in the metadata file.
     * Successfully stored records will be attached to the
     * document, by the record's index in this array.
     */
    items: z.array(StoredParseRecord),
  })
);

export type FailedDMDTask = z.infer<typeof FailedDMDTask>;

/**
 * DMDTask whose metadata file could be processed into individual records.
 * (Final Results Step: warning/success)
 */
export const SucceededDMDTask = QueuedDMDTask.merge(
  z.object({
    /**
     * The items in the file have had their metadata stored.
     */
    process: SucceededProcessResult,

    /**
     * List of individual items found in the metadata file.
     * Successfully stored records will be attached to the
     * document, by the record's index in this array.
     */
    items: z.array(StoredParseRecord),
  })
);

export type SucceededDMDTask = z.infer<typeof SucceededDMDTask>;

/**
 * A descriptive metadata task (DMDTask) can be in three states:
 *
 * 1. Waiting(=undefined)
 * 2. In-queue
 * 3. Success/warning/fail
 *
 *
 * 1. Waiting for background processing to complete (ValidatingDMDTask). An uploaded metadata file in a format hopefully matching `mdType` has been attached to the task.
 * 2. Reporting that background processing could not split or validate the metadata file (FailedDMDTask).
 * 3. Reporting that background processing could split or validate the metadata file. The processor attempted to parse each individual item it extracted from the file; those items that parsed successfully have their own attachments added to the document.
 */
export const DMDTask = z.union([
  SucceededDMDTask,
  FailedDMDTask,
  QueuedDMDTask,
  ValidatedDMDTask,
  ValidatingDMDTask,
]);

export type DMDTask = z.infer<typeof DMDTask>;
