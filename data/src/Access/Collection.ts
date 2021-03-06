import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";
import { Noid, schema as noidSchema } from "../Format/Noid";
import { Text, schema as textSchema } from "../Util/Text";
import { Canonical, schema as canonicalSchema } from "./Canonical";

const BEHAVIORS = ["unordered", "individuals", "multi-part"];

export type Member = {
  /**
   * The member's Noid.
   */
  id: Noid;
  /**
   * The short label for this member in this collection's context.
   * Uses the member's full label by default.
   */
  label?: Text;
};

type CollectionSpec = {
  /**
   * Collections always have the `collection` type.
   */
  type: "collection";
  /**
   * Semantics about the nature of the collection's members list.
   * `unordered` members have no connection to each other,
   * `individuals` are in a meaningful order but the end of one does not
   * link into the beginning of the other, and `multi-part` members are parts
   * of one cohesive whole. If that was too vague, use `unordered` for
   * thematic or project collections, and `multi-part` for serials.
   */
  behavior: typeof BEHAVIORS[number];
  /**
   * The list of members of this collection.
   */
  members: Member[];
};

/**
 * A grouping of other collections and/or manifests.
 */
export type Collection = Canonical & CollectionSpec;

const specSchema = {
  $id: "/access/collection",
  title: "Collection",
  type: "object",
  properties: {
    type: { type: "string", const: "collection" },
    behavior: { type: "string", enum: BEHAVIORS },
    members: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: noidSchema,
          label: { ...textSchema, nullable: true },
        },
        required: ["id"],
      },
    },
  },
  required: ["type", "behavior", "members"],
} as JSONSchemaType<CollectionSpec>;

export const { schema, validate } = inherit<
  Collection,
  Canonical,
  CollectionSpec
>(canonicalSchema, specSchema, false);
