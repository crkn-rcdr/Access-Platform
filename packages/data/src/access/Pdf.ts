import { z } from "zod";
import { AccessObjectTrait } from "./AccessObject.js";
import { FileRef } from "../util/FileRef.js";

/**
 * Any work primarily consisting of a sequence of images.
 */
export const Pdf = z
  .object({
    type: z.enum(["pdf"]),

    /**
     * The PDF file this record points to.
     */
    file: FileRef,
  })
  .merge(AccessObjectTrait);

export type Pdf = z.infer<typeof Pdf>;

/**
 * The staff-editable properties of a Manifest.
 */
export const EditablePdf = Pdf.pick({
  slug: true,
  label: true,
})
  .partial()
  .refine(
    (obj) => Object.keys(obj).length > 0,
    "Cannot edit a manifest with an empty object"
  );

export type EditablePdf = z.infer<typeof EditablePdf>;
