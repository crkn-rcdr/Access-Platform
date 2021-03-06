import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";

/**
 * Any object identified by an `id` string.
 */
export type Identified = {
  id: string;
  _rev?: string;
};

export const { schema, validate } = generateSchema<Identified>({
  $id: "/couch/identified",
  type: "object",
  properties: {
    id: { type: "string" },
    _rev: { type: "string", nullable: true },
  },
  required: ["id"],
} as JSONSchemaType<Identified>);
