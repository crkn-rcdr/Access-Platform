import { z } from "zod";
import { AccessObjectTrait } from "./AccessObject.js";
import { FileRef } from "../util/FileRef.js";
import { TextRecord } from "./util/TextRecord.js";

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

    /**
     * Labels for this PDF's pages.
     */
    pageLabels: z.array(TextRecord),
  })
  .merge(AccessObjectTrait);

export type Pdf = z.infer<typeof Pdf>;
