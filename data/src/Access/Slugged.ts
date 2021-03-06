import AccessObject, { schema as accessObjectSchema } from "./Object";
import Slug, { format as slugFormat } from "../Format/Slug";
import { JSONSchemaType } from "ajv";

interface Local {
  /**
   * Human-readable identifier used to retrieve this object. Any such object
   * without a slug will not be retrievable without access to the object's
   * Noid.
   */
  slug?: Slug;
}

/**
 * Any access object that can have a slug assigned to it.
 */
export default interface SluggedObject extends AccessObject, Local {}

export const schema = accessObjectSchema.mergeInto<SluggedObject>({
  $id: "/access/slugged.json",
  title: "Slugged Object",
  type: "object",
  properties: {
    slug: { ...slugFormat.schema.inline, nullable: true },
  },
  required: [],
} as JSONSchemaType<Local>);
