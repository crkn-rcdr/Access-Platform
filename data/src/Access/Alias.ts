import { JSONSchemaType } from "ajv";
import { Slugged, schema as sluggedSchema } from "./Slugged";
import { Noid, schema as noidSchema } from "../Format/Noid";

interface Local {
  /**
   * All aliases have type `alias`.
   */
  type: "alias";
  /**
   * The Noid of the object this alias points to.
   */
  to: Noid;
}

/**
 * A slug that points to an object primarily identified by another slug.
 */
export interface Alias extends Slugged, Local {}

export const schema = sluggedSchema.mergeInto<Alias>(
  {
    $id: "/access/alias.json",
    title: "Slug Alias",
    type: "object",
    properties: {
      type: { type: "string", const: "alias" },
      to: noidSchema.inline,
    },
    required: ["type", "to"],
  } as JSONSchemaType<Local>,
  true
);
