import { z } from "zod";

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
