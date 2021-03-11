import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";
import { Root, schema as rootSchema } from "./Root";
import { Slug, inline as slugSchema } from "../format/slug";

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
  $id: "/access/Slugged",
  title: "Slugged Object",
  description: "Any access object that can have a slug assigned to it.",
  type: "object",
  properties: {
    slug: {
      ...slugSchema,
      nullable: true,
      description:
        "Human-readable identifier used to retrieve this object. Any such object without a slug will not be retrievable without access to the object's Noid.",
    },
  },
  required: [],
} as JSONSchemaType<SluggedSpec>;

export const { inline, schema, validate } = inherit<Slugged, Root, SluggedSpec>(
  rootSchema,
  specSchema,
  true
);
