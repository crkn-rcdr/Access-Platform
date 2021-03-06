import { JSONSchemaType } from "ajv";
import Schema from "../Schema";
import { Identified, identifiedSchema } from "../Couch";
import { Noid, schema as noidSchema } from "../Format/Noid";
import { Timestamp, schema as timestampSchema } from "../Format/Timestamp";
import {
  ProcessUpdate,
  schema as processUpdateSchema,
} from "../Util/ProcessUpdate";

/**
 * The building blocks of the Canadiana Access Platform.
 */
export interface Root extends Identified {
  /**
   * Unique identifier for this resource.
   */
  id: Noid;
  /**
   * If set, the object was made available to the public at this time.
   * If unset, it is not available to the public.
   */
  public?: Timestamp;
  /**
   * Timestamp for when this object was last updated.
   */
  updated?: Timestamp;
  /**
   * Information about the most recent update to the internalmeta database
   * made because of changes to this object.
   */
  updateInternalmeta?: ProcessUpdate;
}

export const schema = new Schema({
  $id: "/access/object.json",
  title: "Access Object",
  type: "object",
  properties: {
    ...identifiedSchema.full.properties,
    id: noidSchema.inline,
    public: { ...timestampSchema.inline, nullable: true },
    updated: { ...timestampSchema.inline, nullable: true },
    updateInternalmeta: { ...processUpdateSchema.inline, nullable: true },
  },
  required: ["id"],
} as JSONSchemaType<Root>);
