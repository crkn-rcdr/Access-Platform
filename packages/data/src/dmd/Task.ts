import { z } from "zod";

import { ProcessRequest, ProcessResult } from "../util/ProcessUpdate.js";
import { Slug } from "../util/Slug.js";
import { Timestamp } from "../util/Timestamp.js";
import { User } from "../util/User.js";

/**
 * See https://docs.couchdb.org/en/stable/api/document/common.html#attachments
 * I've also defined this in `couch-utils`. Eventually it should live here and be
 * imported by `couch-utils`.
 */
export const CouchAttachmentRecord = z.record(
  z.object({
    content_type: z.string(),
    data: z.string().optional(),
    digest: z.string(),
    encoded_length: z.number().int().min(0).optional(),
    encoding: z.string().optional(),
    length: z.number().optional(),
    revpos: z.number(),
    stub: z.boolean().optional(),
  })
);

export type CouchAttachmentRecord = z.infer<typeof CouchAttachmentRecord>;

/**
 * A newly created task for processing descriptive metadata, awaiting a split operation.
 */
export const SplitRequestDMDTask = z.object({
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
  user: User.optional(),

  /**
   * Prepend this string when looking up objects in preservation and access.
   */
  prefix: Slug,

  /**
   * Type of attached descriptive metadata file.
   */
  mdType: z.enum(["csvissueinfo", "csvdc", "marc490", "marcoocihm", "marcooe"]),

  /**
   * The request to split and process the metadata file into multiple records.
   */
  split: ProcessRequest,

  /**
   * Timestamp of the task's most recent update.
   */
  updated: Timestamp,
});

export type SplitRequestDMDTask = z.infer<typeof SplitRequestDMDTask>;

/**
 * The record of a failed descriptive metadata split operation.
 */
export const SplitFailureDMDTask = SplitRequestDMDTask.merge(
  z.object({
    /**
     * Result update for the split operation.
     */
    split: ProcessResult,
  })
);

export type SplitFailureDMDTask = z.infer<typeof SplitFailureDMDTask>;

const SplitRecord = z.object({
  /**
   * The ID extracted from the descriptive metadata record for this object.
   */
  id: Slug,

  /**
   * Result of the split operation.
   */
  splitResult: z.object({
    /**
     * Found Access Platform slug for this object. May have the prefix prepended.
     */
    accessSlug: Slug.optional(),

    /**
     * Found legacy preservation platform AIP id for this object. May have the prefix prepended.
     */
    preservationId: Slug.optional(),

    /**
     * Whether the descriptive metadata record for this object validated against the `mdType` schema.
     */
    valid: z.boolean(),

    /**
     * Message returned by the split operation.
     */
    message: z.string().optional(),
  }),
});

type SplitRecord = z.infer<typeof SplitRecord>;

/**
 * The record of a successful descriptive metadata split operation.
 */
export const SplitSuccessDMDTask = SplitFailureDMDTask.merge(
  z.object({
    /**
     * List of split records. Not provided if the metadata file could not be parsed.
     */
    items: z.array(SplitRecord).optional(),
  })
);

export type SplitSuccessDMDTask = z.infer<typeof SplitSuccessDMDTask>;

// Could add a refinement to prevent this from parsing
// if the corresponding fields in splitResult are missing
const StoreRecord = SplitRecord.merge(
  z.object({
    /**
     * This object's requested store operations
     */
    storeRequest: z.object({
      access: z.boolean(),
      preservation: z.boolean(),
    }),
  })
);

/**
 * A descriptive metadata task awaiting a store operation.
 */
export const StoreRequestDMDTask = SplitSuccessDMDTask.merge(
  z.object({
    /**
     * Request object for the store process.
     */
    store: ProcessRequest,

    /**
     * Array of objects with their store requests.
     */
    items: z.array(StoreRecord),
  })
);

export type StoreRequestDMDTask = z.infer<typeof StoreRequestDMDTask>;

/**
 * The record of a descriptive metadata store operation.
 */
export const StoreResultDMDTask = StoreRequestDMDTask.merge(
  z.object({
    /**
     * Result object for the store process.
     */
    store: ProcessResult,
  })
);

export type StoreResultDMDTask = z.infer<typeof StoreResultDMDTask>;

/**
 * Record of a descriptive metadata processing task.
 */
export const DMDTask = z.union([
  SplitRequestDMDTask,
  SplitFailureDMDTask,
  SplitSuccessDMDTask,
  StoreRequestDMDTask,
  StoreResultDMDTask,
]);

export type DMDTask = z.infer<typeof DMDTask>;
