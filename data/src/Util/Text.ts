import { JSONSchemaType } from "ajv";
import Schema from "../Schema";

/**
 * Per-language text values.
 */
type Text = Record<string, string>;
export default Text;

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
