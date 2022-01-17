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
import { ProcessRequest, Slug, Timestamp, User } from "..";

/**
 * Base Batch.
 */
export const Batch = z.object({
  /*
   * ID is used as the name of the directory
   */
  id: Slug,

  /*
   * Array of canvases (and/or manifests?)
   */
  canvases: z.array(Slug),

  /*
   * Priority, used to sort batches.
   */
  priority: z.number(),

  /**
   * Record of the user who created this batch.
   */
  user: User,

  /**
   * Timestamp of the batch's most recent update.
   */
  updated: Timestamp,

  /**
   * CouchDB `_attachments` object.
   */
  //attachments: CouchAttachmentRecord.optional(),
});

export type Batch = z.infer<typeof Batch>;

/**
 * Batch at the export step.
 */
export const ExportingBatch = z
  .object({
    /*
     * processUpdate for exporting images into directory
     */
    exportProcess: ProcessRequest,
  })
  .merge(Batch);

export type ExportingBatch = z.infer<typeof ExportingBatch>;

/**
 * Batch at the import.
 */
export const ImportingBatch = z
  .object({
    /*
     * processUpdate for importing XML and PDF files after OCR.
     */
    importProcess: ProcessRequest,
  })
  .merge(ExportingBatch);

export type ImportingBatch = z.infer<typeof ImportingBatch>;
