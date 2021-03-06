import { Root, schema as rootSchema } from "./Root";
import { Slug, schema as slugSchema } from "../Format/Slug";
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
export interface Slugged extends Root, Local {}

export const schema = rootSchema.mergeInto<Slugged>({
  $id: "/access/slugged.json",
  title: "Slugged Object",
  type: "object",
  properties: {
    slug: { ...slugSchema.inline, nullable: true },
  },
  required: [],
} as JSONSchemaType<Local>);
