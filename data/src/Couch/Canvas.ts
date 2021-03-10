import { Document, toCouchSchema } from "../Couch";
import { Canvas, schema as canvasSchema } from "../Access/Canvas";
import { generateSchema } from "../validator";

/**
 * A document in the `canvas` Couch database.
 */
export type CanvasDocument = Document<Canvas>;

export const { inline, schema, validate } = generateSchema<CanvasDocument>({
  $id: "/couch/canvas",
  ...toCouchSchema(canvasSchema),
});
