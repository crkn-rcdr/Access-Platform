import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";
import { UnixFilePath, inline as pathSchema } from "../format/unixFilePath";

/**
 *
 */
export type Mets = {
  path: UnixFilePath;
  md5: string;
};

export const { inline, schema, validate } = generateSchema<Mets>({
  $id: "/util/Mets",
  $comment: "",
  title: "",
  type: "object",
  properties: {
    path: {
      ...pathSchema,
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
