import { JSONSchemaType } from "ajv";
import { Manifest, schema as manifestSchema } from "../Manifest";
import { Text, schema as textSchema } from "../../Util/Text";
import { FileRef, schema as fileSchema } from "../../Util/FileRef";

interface Local {
  from: "pdf";
  /**
   * Reference to the PDF file this manifest was generated from.
   */
  file: FileRef;
  /**
   * Labels for this PDF's pages.
   */
  pageLabels: Text[];
}

/**
 * A manifest for a born-digital PDF.
 */
export interface PdfManifest extends Manifest, Local {}

export const schema = manifestSchema.mergeInto(
  {
    $id: "/access/manifest/pdf.json",
    title: "PDF Manifest",
    type: "object",
    properties: {
      from: { type: "string", const: "pdf" },
      file: fileSchema.inline,
      pageLabels: {
        type: "array",
        items: textSchema.inline,
      },
    },
    required: ["from", "file", "pageLabels"],
  } as JSONSchemaType<Local>,
  true
);
