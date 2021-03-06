import { JSONSchemaType } from "ajv";
import { generateSchema } from "./validator";

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

export type { Canvas, Collection, CanvasManifest, PdfManifest, Alias };

export const { schema, validate } = generateSchema({
  $id: "/access",
  title: "Access Object",
  description: "Any object in the Canadiana Access Platform",
  type: "object",
  oneOf: [
    canvasSchema,
    collectionSchema,
    canvasManifestSchema,
    pdfManifestSchema,
    aliasSchema,
  ],
  required: ["id"],
} as JSONSchemaType<AccessObject>);
