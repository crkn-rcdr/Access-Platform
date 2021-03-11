import { JSONSchemaType } from "ajv";
import { Manifest, schema as manifestSchema } from "./Manifest";
import { Text, inline as textSchema } from "../util/Text";
import { FileRef, inline as fileSchema } from "../util/FileRef";
import { inherit } from "../validator";

type PdfSpec = {
  from: "pdf";
  /**
   * Reference to the PDF file this manifest was generated from.
   */
  file: FileRef;
  /**
   * Labels for this PDF's pages.
   */
  pageLabels: Text[];
};

/**
 * A manifest for a born-digital PDF.
 */
export type PdfManifest = Manifest & PdfSpec;

const specSchema = {
  $id: "/access/PdfManifest",
  title: "PDF Manifest",
  type: "object",
  properties: {
    from: { type: "string", const: "pdf" },
    file: fileSchema,
    pageLabels: {
      type: "array",
      items: textSchema,
    },
  },
  required: ["from", "file", "pageLabels"],
} as JSONSchemaType<PdfSpec>;

export const { inline, schema, validate } = inherit<
  PdfManifest,
  Manifest,
  PdfSpec
>(manifestSchema, specSchema, false);
