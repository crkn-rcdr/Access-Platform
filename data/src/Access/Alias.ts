import { JSONSchemaType } from "ajv";
import { Slugged, schema as sluggedSchema } from "./Slugged";
import { Noid, inline as noidSchema } from "../Format/Noid";
import { inherit } from "../validator";

type AliasSpec = {
  /**
   * All aliases have type `alias`.
   */
  type: "alias";
  /**
   * The Noid of the object this alias points to.
   */
  to: Noid;
};

/**
 * A slug that points to an object primarily identified by another slug.
 */
export type Alias = Slugged & AliasSpec;

const specSchema = {
  $id: "/access/alias",
  title: "Slug Alias",
  type: "object",
  properties: {
    type: { type: "string", const: "alias" },
    to: noidSchema,
  },
  required: ["type", "to"],
} as JSONSchemaType<AliasSpec>;

export const { inline, schema, validate } = inherit<Alias, Slugged, AliasSpec>(
  sluggedSchema,
  specSchema,
  false
);
