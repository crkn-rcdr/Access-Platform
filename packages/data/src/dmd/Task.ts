import { z } from "zod";

import { CouchAttachmentRecord } from "../util/CouchAttachmentRecord.js";
import {
  ProcessRequest,
  ProcessResult,
  SucceededProcessResult,
  FailedProcessResult,
} from "../util/ProcessUpdate.js";
import { Timestamp } from "../util/Timestamp.js";
import { User } from "../util/User.js";

import { DMDFORMATS, DMDOUTPUTS } from "./types.js";

/**
 * The result of attempting to parse an individual metadata
 * record, after it has been split from the task's file.
 */
export const ItemProcessRecord = z
  .object({
    /**
     * Whether this record's metadata has been parsed successfully.
     */
    parsed: z.boolean().optional(),

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

    /**
     * Whether this record's metadata has been stored successfully.
     */
    stored: z.boolean().optional(),

    /**
     * This field tells the metadata processor where to store the new metadata to.
     */
    destination: z.enum(["access", "preservation"]).optional(), // if not defined, then  not yet at the "Process Metadata File" stage.

    /**
     * Tells the back end script if the item has been selected for storage.
     */
    shouldStore: z.boolean().optional(),
  })
  .refine(
    (record) => !record.parsed || (record.id && record.output && record.label),
    "A successfully parsed record must provide: output, id, label."
  );
export type ItemProcessRecord = z.infer<typeof ItemProcessRecord>;

/**
 * DMDTask file is being uploaded to split, validate, and flatten the metadata in the attached file.
 * (Upload Attachment Step: waiting)
 */
export const ParsingDMDTask = z.object({
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

export type ParsingDMDTask = z.infer<typeof ParsingDMDTask>;

/**
 * DMD Task is being added to the queue for storing each item's new metadata file.
 * (Process Metadata File Step: in-queue)
 */
export const ParsedDMDTask = ParsingDMDTask.merge(
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
    items: z.array(ItemProcessRecord),
  })
);

const ParsedDMDTaskListCheck = ParsedDMDTask.refine(
  (task) =>
    task.items?.[0] &&
    !("destination" in task.items[0]) &&
    !("stored" in task.items[0]),
  "A validated task has items without a destination property and without a stored property."
);

export type ParsedDMDTask = z.infer<typeof ParsedDMDTaskListCheck>;

/**
 * DMD Task is being added to the queue for storing each item's new metadata file.
 * (Process Metadata File Step: in-queue)
 */
export const UpdatingDMDTask = ParsedDMDTask.merge(
  z.object({
    /**
     * The request to queue the items for storage.
     */
    process: ProcessRequest,
  })
);

const UpdatingDMDTaskListCheck = UpdatingDMDTask.refine(
  (task) =>
    task.items?.[0] &&
    "destination" in task.items[0] &&
    !("stored" in task.items[0]),
  "A queued task has items with a destination property but without a stored property."
);

export type UpdatingDMDTask = z.infer<typeof UpdatingDMDTaskListCheck>;

/**
 * DMDTask whose metadata file could not be processed into individual records.
 * (Final Results Step: fail)
 */
export const UpdateFailedDMDTask = UpdatingDMDTask.merge(
  z.object({
    /**
     * The items in the file have not had their metadata stored
     */
    process: FailedProcessResult,
  })
).refine(
  (task) =>
    task.items?.[0] &&
    "destination" in task.items[0] &&
    "stored" in task.items[0],
  "A failed task has items with a destination property and a stored property."
);
export type UpdateFailedDMDTask = z.infer<typeof UpdateFailedDMDTask>;

/**
 * DMDTask whose metadata file could be processed into individual records.
 * (Final Results Step: warning/success)
 */
export const UpdateSucceededDMDTask = UpdatingDMDTask.merge(
  z.object({
    /**
     * The items in the file have had their metadata stored.
     */
    process: SucceededProcessResult,
  })
).refine(
  (task) =>
    task.items?.[0] &&
    "destination" in task.items[0] &&
    "stored" in task.items[0],
  "A succeeded task has items with a destination property and a stored property."
);
export type UpdateSucceededDMDTask = z.infer<typeof UpdateSucceededDMDTask>;

/**
 * A descriptive metadata task (DMDTask) can be in four states:
 *
 * 1. Parsing
 * 2. Parsed (Reporting that background processing could split or validate the metadata file. The processor attempted to parse each individual item it extracted from the file; those items that parsed successfully have their own attachments added to the document.)
 * 3. Updating
 * 4. Update Success/warning/fail (Reporting that each item's metadata file was updated, or not.)
 *
 */
export const DMDTask = z.union([
  UpdateSucceededDMDTask,
  UpdateFailedDMDTask,
  UpdatingDMDTask,
  ParsedDMDTask,
  ParsingDMDTask,
]);

export type DMDTask = z.infer<typeof DMDTask>;
