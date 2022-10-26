import { z } from "zod";

import { CouchAttachmentRecord } from "../util/CouchAttachmentRecord.js";
import {
  ProcessRequest,
  //ProcessResult,
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
     * Tells the back end script if the item has been selected for storage.
     */
    shouldStore: z.boolean().optional(),

    /**
     * Tells the back end script if the item id has resolved in the dmd task's destination.
     */
    found: z.boolean().optional(),
  })
  .refine(
    (record) => !record.parsed || (record.id && record.output && record.label),
    "A successfully parsed record must provide: output, id, label."
  );
export type ItemProcessRecord = z.infer<typeof ItemProcessRecord>;

export const BaseDMDTask = z.object({
  /**
   * Unique ID assigned to the task.
   */
  id: z.string(),

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
   * Timestamp of the task's most recent update.
   */
  updated: Timestamp,

  /**
   * CouchDB `_attachments` object.
   */
  attachments: CouchAttachmentRecord.optional(),

  /**
   * Allows for tracking if multi-part collections should be made from items that were not found
   */
  createOption: z.boolean().optional(),
});

/**
 * TypeScript class
 */
export type BaseDMDTask = z.infer<typeof BaseDMDTask>;

export const ParsingQueuedDMDTask = BaseDMDTask.merge(
  z.object({
    /**
     * The request to split, validate, and flatten the metadata in the attached file.
     */
    process: ProcessRequest,
  })
);

/**
 * TypeScript class
 */
export type ParsingQueuedDMDTask = z.infer<typeof ParsingQueuedDMDTask>;

export const ParsingDMDTask = ParsingQueuedDMDTask.merge(
  z.object({
    /**
     */
    stage: z.literal("parsing"),
  })
);

/**
 * TypeScript class
 */
export type ParsingDMDTask = z.infer<typeof ParsingDMDTask>;

export const ParsingFailedDMDTask = ParsingQueuedDMDTask.merge(
  z.object({
    /**
     * The items in the file have not had their metadata processed.
     */
    process: FailedProcessResult,
  })
);

/**
 * TypeScript class
 */
export type ParsingFailedDMDTask = z.infer<typeof ParsingFailedDMDTask>;

export const ParsingSucceededDMDTask = ParsingQueuedDMDTask.merge(
  z.object({
    /**
     * The items in the file have had their metadata processed.
     */
    process: SucceededProcessResult,

    /**
     * List of individual items found in the metadata file.
     * Successfully parsed records will be attached to the
     * document, by the record's index in this array.
     */
    items: z.array(ItemProcessRecord),

    /**
     * Count of individual items found in the metadata file.
     */
    itemsCount: z.number(),
  })
);

const ParsingSucceededDMDTaskCheck = ParsingSucceededDMDTask.refine((task) => {
  let firstItem = null;
  if (task.items && task.items.length) firstItem = task.items[0];
  return firstItem && !("stored" in firstItem);
}, "A validated task has items without a shouldStore property and without a stored property.");

/**
 * TypeScript class
 */
export type ParsingSucceededDMDTask = z.infer<
  typeof ParsingSucceededDMDTaskCheck
>;

export const StoreQueuedDMDTask = ParsingSucceededDMDTask.merge(
  z.object({
    /**
     *
     */
    destination: z.enum(["access", "preservation"]),

    /**
     * The request to queue the items for storage.
     */
    process: ProcessRequest,
  })
);

const StoreQueuedDMDTaskCheck = StoreQueuedDMDTask.refine((task) => {
  let firstItem;
  for (const item of task.items) {
    if (item.shouldStore) {
      firstItem = item;
      break;
    }
  }
  return firstItem && "shouldStore" in firstItem && !("stored" in firstItem);
}, "A queued task has items with a shouldStore property but without a stored property.");

export type StoreQueuedDMDTask = z.infer<typeof StoreQueuedDMDTaskCheck>;

export const StoringDMDTask = StoreQueuedDMDTask.merge(
  z.object({
    /**
     */
    stage: z.literal("store-started"),

    /**
     */
    progress: z.number(),
  })
);

/**
 * TypeScript class
 */
export type StoringDMDTask = z.infer<typeof StoringDMDTask>;

export const StoringFailedDMDTask = StoreQueuedDMDTask.merge(
  z.object({
    /**
     * The items in the file have not had their metadata stored
     */
    process: FailedProcessResult,
  })
).refine((task) => {
  let firstItem;
  for (const item of task.items) {
    if (item.shouldStore) {
      firstItem = item;
      break;
    }
  }

  let lastItem;
  for (let i = task.items.length - 1; i >= 0; i--) {
    if (task.items?.[i]?.shouldStore) {
      lastItem = task.items[i];
      break;
    }
  }

  return (
    firstItem &&
    "shouldStore" in firstItem &&
    "stored" in firstItem &&
    lastItem &&
    "shouldStore" in lastItem &&
    "stored" in lastItem
  );
}, "A failed task has items with a shouldStore property and a stored property.");

/**
 * TypeScript class
 */
export type StoringFailedDMDTask = z.infer<typeof StoringFailedDMDTask>;
export const StoringPausedDMDTask = StoreQueuedDMDTask.merge(
  z.object({
    /**
     * The items in the file have had their metadata stored.
     */
    process: SucceededProcessResult,

    stage: z.literal("store-paused"),
  })
).refine((task) => {
  if (!task.items) return false;

  let lastItem;
  for (let i = task.items.length - 1; i >= 0; i--) {
    if (task.items?.[i]?.shouldStore) {
      lastItem = task.items[i];
      break;
    }
  }
  return lastItem && "shouldStore" in lastItem && !("stored" in lastItem);
}, "A paused update task has items with a shouldStore property and might have some with a stored property, but not all.");

/**
 * TypeScript class
 */
export type StoringPausedDMDTask = z.infer<typeof StoringPausedDMDTask>;

export const StoringSucceededDMDTask = StoreQueuedDMDTask.merge(
  z.object({
    /**
     * The items in the file have had their metadata stored.
     */
    process: SucceededProcessResult,
  })
).refine((task) => {
  let firstItem;
  for (const item of task.items) {
    if (item.shouldStore) {
      firstItem = item;
      break;
    }
  }

  let lastItem;
  for (let i = task.items.length - 1; i >= 0; i--) {
    if (task.items?.[i]?.shouldStore) {
      lastItem = task.items[i];
      break;
    }
  }

  return (
    firstItem &&
    "shouldStore" in firstItem &&
    "stored" in firstItem &&
    lastItem &&
    "shouldStore" in lastItem &&
    "stored" in lastItem
  );
}, "A succeeded task has items with a shouldStore property and a stored property.");

/**
 * TypeScript class
 */
export type StoringSucceededDMDTask = z.infer<typeof StoringSucceededDMDTask>;

/**
 * A descriptive metadata task (DMDTask) in any state
 */
export const DMDTask = z.union([
  StoringPausedDMDTask,
  StoringSucceededDMDTask,
  StoringFailedDMDTask,
  StoringDMDTask,
  StoreQueuedDMDTask,
  ParsingSucceededDMDTask,
  ParsingFailedDMDTask,
  ParsingDMDTask,
  ParsingQueuedDMDTask,
  BaseDMDTask,
]);

export type DMDTask = z.infer<typeof DMDTask>;

const ShortTaskType = z.enum([
  "N/A",
  "store paused",
  "store succeeded",
  "store failed",
  "store queued",
  "storing",
  "parse succeeded",
  "parse failed",
  "parse queued",
  "parsing",
]);

export type ShortTaskType = z.infer<typeof ShortTaskType>;
/**
 * Used to list the DMD Tasks
 */
export type ShortTask = {
  id: string;
  fileName: string;
  type: ShortTaskType;
  date: string | number;
  count: number;
  message: string;
};
