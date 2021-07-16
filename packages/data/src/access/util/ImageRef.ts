import { z } from "zod";
import { ProcessUpdate } from "../../util/ProcessUpdate.js";
import { UnixFilePath } from "../../util/UnixFilePath.js";

/**
 * Reference to a stored image, which can be found in either the legacy preservation
 * repository or the access platform file store.
 */
export const ImageRef = z
  .object({
    /**
     * Path to the file in the legacy preservation repository.
     */
    path: UnixFilePath.optional(),

    /**
     * Image file extension. Supported: "jpeg", "jpg", "jp2", "tif", "tiff"
     */
    extension: z.enum(["jpg", "jp2", "jpeg", "tif", "tiff"]).optional(),

    /**
     * Size of the file, in bytes.
     */
    size: z.number().min(0),

    /**
     * RFC 2046 Media Type (formerly MIME). Supported: "image/jpeg", "image/jp2", "image/tiff"
     */
    mime: z.enum(["image/jpeg", "image/jp2", "image/tiff"]),

    /**
     * Image height, in pixels. Implies that `width` is defined.
     */
    height: z.number().min(0).optional(),

    /**
     * Image width, in pixels. Implies that `height` is defined.
     */
    width: z.number().min(0).optional(),

    /**
     * Update for the service that supplies dimension information.
     */
    update: ProcessUpdate.optional(),
  })
  .superRefine((obj, ctx) => {
    if (typeof obj.height === "number" && typeof obj.width === "undefined") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`width` must be specified when `height` is.",
      });
    }

    if (typeof obj.width === "number" && typeof obj.height === "undefined") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`height` must be specified when `width` is.",
      });
    }

    if (typeof obj.path === "string" && typeof obj.extension === "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`path` and `extension` cannot both be provided.",
      });
    }

    if (
      typeof obj.path === "undefined" &&
      typeof obj.extension === "undefined"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "One of `path` and `extension` must be provided.",
      });
    }
  });

export type ImageRef = z.infer<typeof ImageRef>;
