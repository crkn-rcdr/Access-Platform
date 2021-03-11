import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";

/**
 * Per-language text values.
 */
export type Text = Record<string, string>;

export const { inline, schema, validate } = generateSchema<Text>({
  $id: "/util/Text",
  title: "Text field",
  type: "object",
  patternProperties: {
    "^[\\w\\-]+$": { type: "string" },
  },
  minProperties: 1,
  required: [],
} as JSONSchemaType<Text>);
