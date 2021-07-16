import { z } from "zod";
import { MD5 } from "../../util/MD5.js";
import { UnixFilePath } from "../../util/UnixFilePath.js";

/**
 * Reference to a stored file. The location of the file will either be
 * determined by the `path` property, the `extension` property, or the
 * field's key.
 */
export const FileRef = z
  .object({
    /**
     * Path to the file in the legacy preservation repository.
     */
    path: UnixFilePath.optional(),

    /**
     * File extension for something referenced in the access object store.
     */
    extension: z.string().min(0).max(6).optional(),

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
  })
  .refine(
    (obj) =>
      !(typeof obj.path === "string" && typeof obj.extension === "string"),
    "`path` and `extension` cannot both be provided."
  );

export type FileRef = z.infer<typeof FileRef>;
