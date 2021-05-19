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
    },
    email: {
      type: "string",
      description: "",
      $comment: "",
    },
  },
  required: ["name", "email"],
} as unknown as JSONSchemaType<User>);
