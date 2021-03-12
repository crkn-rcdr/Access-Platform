import { generateSchema } from "../validator";
import { Document as CouchDocument, toCouchSchema } from "./util";

import { Collection, inline as collectionSchema } from "../access/Collection";
import {
  CanvasManifest,
  inline as canvasManifestSchema,
} from "../access/CanvasManifest";
import {
  PdfManifest,
  inline as pdfManifestSchema,
} from "../access/PdfManifest";
import { Alias, inline as aliasSchema } from "../access/Alias";

/**
 * A document in the `access` Couch database.
 */
export type Document =
  | CouchDocument<Collection>
  | CouchDocument<CanvasManifest>
  | CouchDocument<PdfManifest>
  | CouchDocument<Alias>;

export const { inline, schema, validate } = generateSchema<Document>({
  $id: "/couch/access",
  description: "A document in the `access` Couch database.",
  type: "object",
  oneOf: [
    toCouchSchema(collectionSchema),
    toCouchSchema(canvasManifestSchema),
    toCouchSchema(pdfManifestSchema),
    toCouchSchema(aliasSchema),
  ],
  required: ["_id", "type"],
});
