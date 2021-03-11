import { JSONSchemaType } from "ajv";
import { Manifest, schema as manifestSchema } from "./Manifest";
import { Noid, inline as noidSchema } from "../format/noid";
import { Text, inline as textSchema } from "../util/Text";
import { FileRef, inline as fileSchema } from "../util/FileRef";
import { inherit } from "../validator";

export type Canvas = {
  id: Noid;
  /**
   * The canvas's label in the context of this manifest.
   */
  label: Text;
};

type CanvasesSpec = {
  from: "canvases";
  /**
   * The manifest's canvas list.
   */
  canvases: Canvas[];
  /**
   * Information about the derivative PDF generated by OCR.
   * If path is not specified, a file should exist in the
   * access object store at $id.pdf
   */
  ocrPdf?: FileRef;
};

export type CanvasManifest = Manifest & CanvasesSpec;

const specSchema = {
  $id: "/access/CanvasManifest",
  title: "Canvas Manifest",
  type: "object",
  properties: {
    from: { type: "string", const: "canvases" },
    canvases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: noidSchema,
          label: textSchema,
        },
        required: ["id", "label"],
      },
    },
    ocrPdf: { ...fileSchema, nullable: true },
  },
  required: ["from", "canvases"],
} as JSONSchemaType<CanvasesSpec>;

export const { inline, schema, validate } = inherit<
  CanvasManifest,
  Manifest,
  CanvasesSpec
>(manifestSchema, specSchema, false);