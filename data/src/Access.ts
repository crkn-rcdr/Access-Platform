import { JSONSchemaType } from "ajv";
import { generateSchema } from "./validator";

import { Collection, schema as collectionSchema } from "./Access/Collection";
import {
  CanvasManifest,
  schema as canvasManifestSchema,
} from "./Access/Manifest/Canvases";
import {
  PdfManifest,
  schema as pdfManifestSchema,
} from "./Access/Manifest/Pdf";
import { Alias, schema as aliasSchema } from "./Access/Alias";

/**
 * Any kind of access object, canvases excluded.
 */
export type AccessObject = Collection | CanvasManifest | PdfManifest | Alias;

export const { inline, schema, validate } = generateSchema({
  $id: "/access",
  title: "Access Object",
  description: "Any object in the Canadiana Access Platform",
  type: "object",
  oneOf: [
    collectionSchema,
    canvasManifestSchema,
    pdfManifestSchema,
    aliasSchema,
  ],
  required: ["id"],
} as JSONSchemaType<AccessObject>);
