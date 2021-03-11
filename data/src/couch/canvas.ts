import { Document as CouchDocument, toCouchSchema } from "./util";
import { Canvas, schema as canvasSchema } from "../access/Canvas";
import { generateSchema } from "../validator";

/**
 * A document in the `canvas` Couch database.
 */
export type Document = CouchDocument<Canvas>;

export const { inline, schema, validate } = generateSchema<Document>({
  $id: "/couch/canvas",
  ...toCouchSchema(canvasSchema),
});
