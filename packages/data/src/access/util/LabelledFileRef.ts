import { z } from "zod";
import { MD5 } from "../../util/MD5.js";
import { TextRecord } from "./TextRecord.js";

/**
 * A reference to a file stored in Swift, that has an associated label.
 * For use in a IIIF-style `rendering` field.
 */
export const LabelledFileRef = z.object({
  label: TextRecord,

  /**
   * Extension beyond the associated noid for this file.
   * e.g. for a PDF of images 1-10 of noid 69429/example, with an extension
   * of `_01-10.pdf` the file can be found at
   * `SWIFT_CONTAINER_URL/69429/example_01-10.pdf`.
   */
  extension: z.string(),

  /**
   * Size of the file, in bytes.
   */
  size: z.number().min(0),

  /**
   * RFC 2046 Media Type (formerly MIME).
   */
  mime: z
    .string()
    .regex(/^\w+\/\w+$/)
    .optional(),

  /**
   * MD5 checksum.
   */
  md5: MD5.optional(),
});

export type LabelledFileRef = z.infer<typeof LabelledFileRef>;
