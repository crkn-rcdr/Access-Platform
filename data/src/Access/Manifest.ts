import { JSONSchemaType } from "ajv";
import { Canonical, schema as canonicalSchema } from "./Canonical";

const BEHAVIORS = ["unordered", "individuals", "contiuous", "paged"];
const DIRECTIONS = [
  "left-to-right",
  "right-to-left",
  "top-to-bottom",
  "bottom-to-top",
];

interface Local {
  /**
   * All manifests have type `manifest`.
   */
  type: "manifest";
  /**
   * Semantics about what the order of the series of images means.
   */
  behavior?: typeof BEHAVIORS[number];
  viewingDirection?: typeof DIRECTIONS[number];
}

/**
 * Any work primarily consisting of a sequence of images.
 */
export interface Manifest extends Canonical, Local {}

export const schema = canonicalSchema.mergeInto<Manifest>({
  $id: "/access/manifest.json",
  title: "Manifest",
  type: "object",
  properties: {
    type: { type: "string", const: "manifest" },
    behavior: {
      type: "string",
      enum: BEHAVIORS,
      default: "continuous",
      nullable: true,
    },
    viewingDirection: {
      type: "string",
      enum: DIRECTIONS,
      default: "left-to-right",
      nullable: true,
    },
  },
  required: ["type"],
} as JSONSchemaType<Local>);
