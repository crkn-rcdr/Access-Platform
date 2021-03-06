import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";

/**
 * Per-language text values.
 */
export type Text = Record<string, string>;

export const { schema, validate } = generateSchema<Text>({
  $id: "/util/text",
  title: "Text field",
  type: "object",
  patternProperties: {
    "^[\\w\\-]+$": { type: "string" },
  },
  minProperties: 1,
  required: [],
} as JSONSchemaType<Text>);
