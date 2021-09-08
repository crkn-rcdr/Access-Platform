import { z } from "zod";
import { CouchAttachmentRecord } from "../util/CouchAttachmentRecord.js";
import { Timestamp } from "../util/Timestamp.js";

/**
 * TODO: document what each object is, do stricter checks, determine what's optional or not.
 */

const MetsItem = z.object({
  path: z.string().optional(), // data/sip/data/metadata.xml,
  md5: z.string().optional(), //dcbb7121c585374e19547ce20d034980
});

const ProcessItemReq = z.object({
  request: z.string().optional(), // todo - enum
  date: Timestamp.optional(),
  processhost: z.string().optional(), //todo - regex
  processdate: Timestamp.optional(),
});

const ProcessItem = z.object({
  "manifest date": Timestamp.optional(),
  message: z.string().optional(),
  reqdate: Timestamp.optional(),
  request: z.string().optional(), // todo - enum
  host: z.string().optional(), //todo - regex
  status: z.boolean().optional(),
  "manifest md5": z.string().optional(), // todo, md5
  date: Timestamp.optional(),
  req: z.array(ProcessItemReq).optional(), // todo
});

const FileSystem = z.object({
  configid: z.string().optional(),
  identifier: z.string().optional(),
  foundDate: Timestamp.optional(),
  moveDate: Timestamp.optional(),
});

const Classify = z.object({
  directory: z.number().optional(),
});

/**
 * DMDTask awaiting processing.
 */
export const WipmetaObject = z.object({
  /**
   * Unique ID.
   */
  id: z.string(),

  /**
   * CouchDB `_attachments` object.
   */
  attachments: CouchAttachmentRecord.optional(),

  created: Timestamp.optional(),
  label: z.string().optional(),
  updated: Timestamp.optional(),
  processReq: z.array(z.any()).optional(), // todo: what does this look like
  filesystem: FileSystem.optional(),
  processHistory: z.array(ProcessItem).optional(),
  classify: Classify.optional(),
  repos: z.array(z.string()).optional() /* Todo: enum*/,
  reposManifestDate: Timestamp.optional(),
  METS: z.array(MetsItem),
  METSManifestDate: Timestamp.optional(),
  METSDate: Timestamp.optional(),
});

export type WipmetaObject = z.infer<typeof WipmetaObject>;
