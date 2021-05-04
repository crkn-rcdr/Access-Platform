import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";
import { Canonical, schema as canonicalSchema } from "./Canonical";

const BEHAVIORS = ["unordered", "individuals", "continuous", "paged"];
const DIRECTIONS = [
  "left-to-right",
  "right-to-left",
  "top-to-bottom",
  "bottom-to-top",
];

type ManifestSpec = {
  type: "manifest";

  /**
   * Semantics about what the order of the series of images means.
   * Default value: `continuous`
   */
  behavior?: typeof BEHAVIORS[number];

  /**
   * Direction the manifest's images are meant to be viewed in.
   * Default value: `left-to-right`
   */
  viewingDirection?: typeof DIRECTIONS[number];
};

/**
 * Any work primarily consisting of a sequence of images.
 */
export type Manifest = Canonical & ManifestSpec;

const specSchema = {
  $id: "/access/Manifest",
  title: "Manifest",
  description: "Any work primarily consisting of a sequence of images.",
  type: "object",
  properties: {
    type: { type: "string", const: "manifest" },
    behavior: {
      description:
        "Semantics about what the order of the series of images means.",
      type: "string",
      enum: BEHAVIORS,
      default: "continuous",
      nullable: true,
    },
    viewingDirection: {
      description: "Direction the manifest's images are meant to be viewed in.",
      type: "string",
      enum: DIRECTIONS,
      default: "left-to-right",
      nullable: true,
    },
  },
  required: ["type"],
} as JSONSchemaType<ManifestSpec>;

export const { inline, schema, validate } = inherit<
  Manifest,
  Canonical,
  ManifestSpec
>(canonicalSchema, specSchema, true);
