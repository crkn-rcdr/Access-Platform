import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";
import { Slugged, inline as sluggedSchema } from "./Slugged";
import { Text, inline as textSchema } from "../util/Text";

const DMD = ["dc", "marc", "issueinfo"];

type CanonicalSpec = {
  /**
   * Human-readable name or title.
   */
  label: Text;

  /**
   * A short textual summary.
   */
  summary?: Text;

  /**
   * The type of descriptive metadata record associated with this resource.
   */
  dmdType?: typeof DMD[number];
};

/**
 * A slugged object representing a real thing, as opposed to an alias.
 */
export type Canonical = Slugged & CanonicalSpec;

const specSchema = {
  $id: "/access/Canonical",
  title: "Canonical object",
  description:
    "A slugged object representing a real thing, as opposed to an alias.",
  type: "object",
  properties: {
    label: {
      ...textSchema,
      description: "Human-readable name or title.",
    },
    summary: {
      ...textSchema,
      nullable: true,
      description: "A short textual summary.",
    },
    dmdType: {
      description:
        "The type of descriptive metadata record associated with this resource.",
      type: "string",
      enum: DMD,
      nullable: true,
    },
  },
  required: ["label"],
} as JSONSchemaType<CanonicalSpec>;

export const { inline, schema, validate } = inherit<
  Canonical,
  Slugged,
  CanonicalSpec
>(sluggedSchema, specSchema, true);
