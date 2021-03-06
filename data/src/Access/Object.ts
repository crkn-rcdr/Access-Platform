import { JSONSchemaType } from "ajv";
import { Identified, identifiedSchema } from "../Couch";
import DateTime, { format as dateTimeFormat } from "../Format/DateTime";
import Noid, { format as noidFormat } from "../Format/Noid";
import Schema from "../Schema";
import ProcessUpdate, {
  schema as processUpdateSchema,
} from "../Util/ProcessUpdate";

/**
 * The building blocks of the Canadiana Access Platform.
 */
export default interface AccessObject extends Identified {
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
    id: noidFormat.schema.inline,
    public: { ...dateTimeFormat.schema.inline, nullable: true },
    updated: { ...dateTimeFormat.schema.inline, nullable: true },
    updateInternalmeta: { ...processUpdateSchema.inline, nullable: true },
  },
  required: ["id"],
} as JSONSchemaType<AccessObject>);
