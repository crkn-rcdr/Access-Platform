import { generateSchema } from "../validator";
import { Document as CouchDocument, toCouchSchema } from "./util";

import { Collection, schema as collectionSchema } from "../access/Collection";
import {
  CanvasManifest,
  schema as canvasManifestSchema,
} from "../access/CanvasManifest";
import {
  PdfManifest,
  schema as pdfManifestSchema,
} from "../access/PdfManifest";
import { Alias, schema as aliasSchema } from "../access/Alias";

/**
 * A document in the `access` Couch database.
 */
export type Document = CouchDocument<
  Collection | CanvasManifest | PdfManifest | Alias
>;

const couchCollection = {
  properties: toCouchSchema(collectionSchema).properties,
};
const couchCanvasManifest = {
  properties: toCouchSchema(canvasManifestSchema).properties,
};
const couchPdfManifest = {
  properties: toCouchSchema(pdfManifestSchema).properties,
};
const couchAlias = { properties: toCouchSchema(aliasSchema).properties };

export const { inline, schema, validate } = generateSchema<Document>({
  $id: "/couch/access",
  type: "object",
  oneOf: [couchCollection, couchCanvasManifest, couchPdfManifest, couchAlias],
  required: ["_id", "type"],
});
