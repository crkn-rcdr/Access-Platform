import { z } from "zod";
import { CouchAttachmentRecord } from "../util/CouchAttachmentRecord.js";
import { WipmetaTimestamp } from "./WipmetaTimestamp.js";

/**
 * TODO: document what each object is, do stricter checks, determine what's optional or not.
 */

const MetsItem = z.object({
  path: z.string().optional(), // data/sip/data/metadata.xml,
  md5: z.string().optional(), //dcbb7121c585374e19547ce20d034980
});

const ProcessItemReq = z.object({
  request: z.string().optional(), // todo - enum
  date: WipmetaTimestamp.optional(),
  processhost: z.string().optional(), //todo - regex
  processdate: WipmetaTimestamp.optional(),
});

const ProcessItem = z.object({
  "manifest date": WipmetaTimestamp.optional(),
  message: z.string().optional(),
  reqdate: WipmetaTimestamp.optional(),
  request: z.string().optional(), // todo - enum
  host: z.string().optional(), //todo - regex
  status: z.boolean().optional(),
  "manifest md5": z.string().optional(), // todo, md5
  date: WipmetaTimestamp.optional(),
  req: z.array(ProcessItemReq).optional(), // todo
});

const FileSystem = z.object({
  configid: z.string().optional(),
  identifier: z.string().optional(),
  foundDate: WipmetaTimestamp.optional(),
  moveDate: WipmetaTimestamp.optional(),
});

const Classify = z.object({
  directory: z.number().optional(),
});

/**
 * DMDTask awaiting processing.
 */
export const WipmetaObject = z.object({
  /**
   * Unique ID. This matches the prefix.slug format
   */
  id: z.string(),

  /**
   * A string label that describes the object in more detail
   */
  label: z.string().optional(),

  /**
   * A string WipmetaTimestamp used to denote the last time the object was updated.
   */
  updated: WipmetaTimestamp.optional(),

  /**
   * CouchDB `_attachments` object.
   */
  attachments: CouchAttachmentRecord.optional(),
  // Unimportant fields
  created: WipmetaTimestamp.optional(),
  processReq: z.array(z.any()).optional(), // todo: what does this look like
  filesystem: FileSystem.optional(),
  processHistory: z.array(ProcessItem).optional(),
  classify: Classify.optional(),
  repos: z.array(z.string()).optional() /* Todo: enum*/,
  reposManifestDate: WipmetaTimestamp.optional(),
  METS: z.array(MetsItem).optional(),
  METSManifestDate: WipmetaTimestamp.optional(),
  METSDate: WipmetaTimestamp.optional(),
});

export type WipmetaObject = z.infer<typeof WipmetaObject>;
