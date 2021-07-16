import { z } from "zod";
import { Described } from "./traits/Described.js";
import { Identified } from "./traits/Identified.js";
import { Slugged } from "./traits/Slugged.js";
import { FileRef } from "./util/FileRef.js";
import { ObjectList } from "./util/ObjectList.js";
import { TextRecord } from "./util/TextRecord.js";

/**
 * Any work primarily consisting of a sequence of images.
 */
export const Manifest = z
  .object({
    type: z.enum(["manifest"]),

    /**
     * Type of manifest source.
     */
    from: z.enum(["canvases", "pdf"]),

    /**
     * Semantics about what the order of the series of images means.
     * Default value: `continuous`
     */
    behavior: z
      .enum(["unordered", "individuals", "continuous", "paged"])
      .optional(),

    /**
     * Direction the manifest's images are meant to be viewed in.
     * Default value: `left-to-right`
     */
    viewingDirection: z
      .enum([
        "left-to-right",
        "right-to-left",
        "top-to-bottom",
        "bottom-to-top",
      ])
      .optional(),

    /**
     * Information about the derivative PDF generated by OCR.
     * If path is not specified, a file should exist in the
     * access object store at $id.pdf
     */
    ocrPdf: FileRef.optional(),

    /**
     * The Manifest's Canvas list. Note: optional only because Canvases have not
     * yet been generated for `pdf` Manifests.
     */
    canvases: ObjectList.optional(),

    /**
     * Reference to the PDF file this manifest was generated from.
     */
    file: FileRef.optional(),

    /**
     * Labels for this PDF's pages. Deprecated, as Canvases will be generated
     * for `pdf` Manifests.
     */
    pageLabels: z.array(TextRecord).optional(),
  })
  .merge(Identified)
  .merge(Slugged)
  .merge(Described);

export type Manifest = z.infer<typeof Manifest>;

/**
 * The staff-editable properties of a Manifest.
 */
export const EditableManifest = Manifest.pick({
  slug: true,
  label: true,
  summary: true,
  behavior: true,
  viewingDirection: true,
  canvases: true,
  pageLabels: true,
});

export type EditableManifest = z.infer<typeof EditableManifest>;
