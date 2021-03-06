import SluggedObject, { schema as sluggedObjectSchema } from "./Slugged";
import Noid, { format as noidFormat } from "../Format/Noid";
import { JSONSchemaType } from "ajv";

/**
 * A slug that points to an object primarily identified by another slug.
 */
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

export default interface Alias extends SluggedObject, Local {}

export const schema = sluggedObjectSchema.mergeInto<Alias>(
  {
    $id: "/access/alias.json",
    title: "Slug Alias",
    type: "object",
    properties: {
      type: { type: "string", const: "alias" },
      to: noidFormat.schema.inline,
    },
    required: ["type", "to"],
  } as JSONSchemaType<Local>,
  true
);
