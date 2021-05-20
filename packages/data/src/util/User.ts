import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";

/**
 * Represents a person who uses the platform.
 */
export type User = {
  /**
   * A non-empty string holding the user's name.
   */
  name: string;

  /**
   * A non-empty string with an '@' symbol, holding the user's email.
   */
  email: string;
};

export const { inline, schema, validate } = generateSchema<User>({
  $id: "/util/User",
  $comment: "Represents a person who uses the platform.",
  title: "User",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "A non-empty string holding the user's name.",
      pattern: "^.+$",
    },
    email: {
      type: "string",
      description: "A non-empty string with an '@' symbol, holding the user's email.",
      pattern: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$", //maybe check format looks like an email?
    },
  },
  required: ["name", "email"],
} as unknown as JSONSchemaType<User>);
