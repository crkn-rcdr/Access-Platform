import { JSONSchemaType } from "ajv";
import Schema from "./Schema";
import { Canvas, schema as canvasSchema } from "./Access/Canvas";
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
 * Any object in the Canadiana Access Platform.
 */
export type AccessObject =
  | Canvas
  | Collection
  | CanvasManifest
  | PdfManifest
  | Alias;

export const schema = new Schema<AccessObject>({
  $id: "/access.json",
  title: "Access Object",
  description: "Any object in the Canadiana Access Platform",
  type: "object",
  oneOf: [
    canvasSchema.inline,
    collectionSchema.inline,
    canvasManifestSchema.inline,
    pdfManifestSchema.inline,
    aliasSchema.inline,
  ],
  required: ["id"],
} as JSONSchemaType<AccessObject>);
