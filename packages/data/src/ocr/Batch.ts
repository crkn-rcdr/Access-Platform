/**
 * A data type that allows for the capability
 * to run OCR on access objects in order to
 * provide ALTO and PDF data for content
 * ingested using Archivematica.
 * Batches can be created of a larger group
 * of canvases, rather than being concerned
 * how they may be organized into single or
 * multiple manifests.
 * For more info on OCR see: https://pdf.abbyy.com/learning-center/what-is-ocr/
 */

import { z } from "zod";
import {
  ProcessRequest,
  FailedProcessUpdate,
  SucceededProcessUpdate,
} from "../util/ProcessUpdate.js";
import { Noid } from "../util/Noid.js";
import { Slug } from "../util/Slug.js";
import { StaffUpdate } from "../util/StaffUpdate.js";

/**
 *
 * Base OcrBatch.
 */
export const BaseOcrBatch = z.object({
  /*
   * ID is used as the name of the directory
   */
  id: Slug,

  /*
   * Array of canvases (and/or manifests?)
   */
  canvases: z.array(Noid),

  /*
   * Priority, used to sort batches.
   */
  priority: z.number(),

  /**
   * Record of the user who created this batch.
   */
  staff: StaffUpdate.optional(),
});

export type BaseOcrBatch = z.infer<typeof BaseOcrBatch>;

/**
 * OcrBatch at the export step before the process finishes.
 */
export const ExportWaitingOcrBatch = z
  .object({
    /*
     * processUpdate for exporting images into directory
     */
    exportProcess: ProcessRequest,
  })
  .merge(BaseOcrBatch);

export type ExportWaitingOcrBatch = z.infer<typeof ExportWaitingOcrBatch>;

/**
 * OcrBatch at the export step when the process finishes successfully.
 */
export const ExportSucceededOcrBatch = z
  .object({
    /*
     * processUpdate for exporting images into directory
     */
    exportProcess: SucceededProcessUpdate,
  })
  .merge(BaseOcrBatch);

export type ExportSucceededOcrBatch = z.infer<typeof ExportSucceededOcrBatch>;

/**
 * OcrBatch at the export step when the process finishes unsuccessfully.
 */
export const ExportFailedOcrBatch = z
  .object({
    /*
     * processUpdate for exporting images into directory
     */
    exportProcess: FailedProcessUpdate,
  })
  .merge(BaseOcrBatch);

export type ExportFailedOcrBatch = z.infer<typeof ExportFailedOcrBatch>;

/**
 * OcrBatch at the export step before the process finishes.
 */
export const ImportWaitingOcrBatch = z
  .object({
    /*
     * processUpdate for importing images from the directory
     */
    importProcess: ProcessRequest,
  })
  .merge(ExportSucceededOcrBatch);

export type ImportWaitingOcrBatch = z.infer<typeof ImportWaitingOcrBatch>;

/**
 * OcrBatch at the export step when the process finishes successfully.
 */
export const ImportSucceededOcrBatch = z
  .object({
    /*
     * processUpdate for importing images from the directory
     */
    importProcess: SucceededProcessUpdate,
  })
  .merge(ExportSucceededOcrBatch);

export type ImportSucceededOcrBatch = z.infer<typeof ImportSucceededOcrBatch>;

/**
 * OcrBatch at the export step when the process finishes unsuccessfully.
 */
export const ImportFailedOcrBatch = z
  .object({
    /*
     * processUpdate for importing images from the directory
     */
    importProcess: FailedProcessUpdate,
  })
  .merge(ExportSucceededOcrBatch);

export type ImportFailedOcrBatch = z.infer<typeof ImportFailedOcrBatch>;

export const OcrBatch = z.union([
  ImportSucceededOcrBatch,
  ImportFailedOcrBatch,
  ImportWaitingOcrBatch,
  ExportSucceededOcrBatch,
  ExportFailedOcrBatch,
  ExportWaitingOcrBatch,
  BaseOcrBatch,
]);

export type OcrBatch = z.infer<typeof OcrBatch>;

/**
 * The staff-editable properties of a OcrBatch.
 */
export const EditableOcrBatch = BaseOcrBatch.pick({
  id: true,
  canvases: true,
  priority: true,
})
  .partial()
  .refine(
    (obj) => Object.keys(obj).length > 0,
    "Cannot edit a batch with an empty object"
  );

export type EditableOcrBatch = z.infer<typeof EditableOcrBatch>;
