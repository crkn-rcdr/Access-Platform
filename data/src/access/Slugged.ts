import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";
import { Root, schema as rootSchema } from "./Root";
import { Slug, inline as slugSchema } from "../format/Slug";

type SluggedSpec = {
  /**
   * Human-readable identifier used to retrieve this object. Any such object
   * without a slug will not be retrievable without access to the object's
   * Noid.
   */
  slug?: Slug;
};

/**
 * Any access object that can have a slug assigned to it.
 */
export type Slugged = Root & SluggedSpec;

const specSchema = {
  $id: "/access/slugged",
  title: "Slugged Object",
  type: "object",
  properties: {
    slug: { ...slugSchema, nullable: true },
  },
  required: [],
} as JSONSchemaType<SluggedSpec>;

export const { inline, schema, validate } = inherit<Slugged, Root, SluggedSpec>(
  rootSchema,
  specSchema,
  true
);
