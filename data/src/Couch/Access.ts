import { generateSchema } from "../validator";
import { Document, toCouchSchema } from "../Couch";

import { Collection, schema as collectionSchema } from "../Access/Collection";
import {
  CanvasManifest,
  schema as canvasManifestSchema,
} from "../Access/Manifest/Canvases";
import {
  PdfManifest,
  schema as pdfManifestSchema,
} from "../Access/Manifest/Pdf";
import { Alias, schema as aliasSchema } from "../Access/Alias";

/**
 * A document in the `access` Couch database.
 */
// export type AccessDocument = Document<AccessObject>;
type AccessObject = Collection | CanvasManifest | PdfManifest | Alias;
type AccessDocument = Document<AccessObject>;

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

export const { inline, schema, validate } = generateSchema<AccessDocument>({
  $id: "/couch/access",
  type: "object",
  oneOf: [couchCollection, couchCanvasManifest, couchPdfManifest, couchAlias],
  required: ["_id", "type"],
});
