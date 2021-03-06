import { JSONSchemaType } from "ajv";
import Schema from "../Schema";

/**
 * Per-language text values.
 */
export type Text = Record<string, string>;

export const schema = new Schema({
  $id: "/util/text.json",
  title: "Text field",
  type: "object",
  patternProperties: {
    "^[\\w\\-]+$": { type: "string" },
  },
  minProperties: 1,
  required: [],
} as JSONSchemaType<Text>);
