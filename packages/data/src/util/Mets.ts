import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";

/**
 *
 */
export type Mets = {
  path: string;
  md5: string;
};

export const { inline, schema, validate } = generateSchema<>({
  $id: "/util/Mets",
  $comment: "",
  title: "",
  type: "object",
  properties: {
    path: {
      type: "string",
      description: "",
      $comment: "",
    },
    md5: {
      type: "string",
      description: "",
      $comment: "",
      pattern: "^[0-9a-f]{32}$",
    },
  },
} as unknown as JSONSchemaType<Mets>);
