import { JSONSchemaType } from "ajv";
import Schema from "../Schema";
import { Identified, identifiedSchema } from "../Couch";
import { DateTime, schema as dateTimeSchema } from "../Format/DateTime";
import { Noid, schema as noidSchema } from "../Format/Noid";
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
  public?: DateTime;
  /**
   * Timestamp for when this object was last updated.
   */
  updated?: DateTime;
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
    public: { ...dateTimeSchema.inline, nullable: true },
    updated: { ...dateTimeSchema.inline, nullable: true },
    updateInternalmeta: { ...processUpdateSchema.inline, nullable: true },
  },
  required: ["id"],
} as JSONSchemaType<Root>);
