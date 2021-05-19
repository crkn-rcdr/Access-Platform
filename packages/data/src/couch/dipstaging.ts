import { Document as CouchDocument, toCouchSchema } from "./util";
import { Dipstaging, schema as dipstagingSchema } from "../dipstaging";
import { generateSchema } from "../validator";

/**
 * A document in the `dipstaging` Couch database.
 */
export type DipstagingDocument = CouchDocument<Dipstaging>;

export const { inline, schema, validate } = generateSchema<DipstagingDocument>({
  ...toCouchSchema(dipstagingSchema),
  $id: "/couch/dipstaging",
  description: "A document in the `dipstaging` Couch database.",
});
