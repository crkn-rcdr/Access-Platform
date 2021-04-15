import { Document as CouchDocument, toCouchSchema } from "./util";
import { Canvas, schema as canvasSchema } from "../access/Canvas";
import { generateSchema } from "../validator";

/**
 * A document in the `canvas` Couch database.
 */
export type CanvasDocument = CouchDocument<Canvas>;

export const { inline, schema, validate } = generateSchema<CanvasDocument>({
  ...toCouchSchema(canvasSchema),
  $id: "/couch/canvas",
  description: "A document in the `canvas` Couch database.",
});
