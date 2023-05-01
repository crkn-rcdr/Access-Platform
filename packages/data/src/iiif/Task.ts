import { z } from "zod";

import { CouchAttachmentRecord } from "../util/CouchAttachmentRecord.js";
import {
  ProcessRequest,
  SucceededProcessResult,
  FailedProcessResult,
} from "../util/ProcessUpdate.js";
import { Timestamp } from "../util/Timestamp.js";
import { User } from "../util/User.js";


export const BaseIIIFTask = z.object({
  /**
   * Unique ID assigned to the task.
   */
  id: z.string(),

  /**
   * Record of the user who created this task.
   */
  user: User,

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

});



export const JobQueuedIIIFTask = BaseIIIFTask.merge(
  z.object({
    /**
     * The request to queue the items for storage.
     */
    process: ProcessRequest,
  })
);

export type JobQueuedIIIFTask = z.infer<typeof JobQueuedIIIFTask>;

export const JobRunningIIIFTask = JobQueuedIIIFTask.merge(
  z.object({
    /**
     */
    progress: z.number(),
    items: z.array(z.object({
      slug: z.string(),
      succeeded: z.boolean().optional(),
      message: z.string().optional()
    }))
  })
);

/**
 * TypeScript class
 */
export type JobRunningIIIFTask = z.infer<typeof JobRunningIIIFTask>;

export const JobFailedIIIFTask = JobRunningIIIFTask.merge(
  z.object({
    /**
     * The items in the file have not had their metadata stored
     */
    process: FailedProcessResult,
    items: z.array(z.object({
      slug: z.string(),
      succeeded: z.boolean(),
      message: z.string()
    }))
  })
);

/**
 * TypeScript class
 */
export type JobFailedIIIFTask = z.infer<typeof JobFailedIIIFTask>;


export const JobSucceededIIIFTask = JobRunningIIIFTask.merge(
  z.object({
    /**
     * The items in the file have had their metadata stored.
     */
    process: SucceededProcessResult,
    items: z.array(z.object({
      slug: z.string(),
      succeeded: z.boolean(),
      message: z.string()
    }))
  })
);

/**
 * TypeScript class
 */
export type JobSucceededIIIFTask = z.infer<typeof JobSucceededIIIFTask>;

/**
 * A descriptive metadata task (IIIFTask) in any state
 */
export const IIIFTask = z.union([
  JobSucceededIIIFTask,
  JobFailedIIIFTask,
  JobRunningIIIFTask,
  JobQueuedIIIFTask,
  BaseIIIFTask,
]);

export type IIIFTask = z.infer<typeof IIIFTask>;

/**
 * Used to list the IIIF Tasks
 */
export type ShortIIIFTask = {
  id: string;
  fileName: string;
  date: string | number;
  count: number;
  message: string;
  type: string;
};
