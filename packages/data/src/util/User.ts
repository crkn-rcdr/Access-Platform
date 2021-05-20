import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";

/**
 *
 */
export type User = {
  name: string;
  email: string;
};

export const { inline, schema, validate } = generateSchema<User>({
  $id: "/util/User",
  $comment: "",
  title: "",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "",
      $comment: "",
      pattern: "^.+$",
    },
    email: {
      type: "string",
      description: "",
      $comment: "",
      pattern: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$", //maybe check format looks like an email?
    },
  },
  required: ["name", "email"],
} as unknown as JSONSchemaType<User>);
