import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";
import { UnixFilePath, inline as pathSchema } from "../format/unixFilePath";

/**
 * METS is the Metadata Encoding and Transmission Standard, which is applied to encoding metadata via a standardized XML schema. METS handles all types of metadata that is relevant to preservation: descriptive, administrative, and technical/structural metadata are all included in the schema, and a METS document will serve as the container for all of this information about a digital object.
 */
export type Mets = {
  /**
   * Path to the file in the legacy preservation repository.
   */
  path: UnixFilePath;
  /**
   * MD5 checksum.
   */
  md5: string;
};

export const { inline, schema, validate } = generateSchema<Mets>({
  $id: "/util/Mets",
  $comment: "METS is the Metadata Encoding and Transmission Standard, which is applied to encoding metadata via a standardized XML schema. METS handles all types of metadata that is relevant to preservation: descriptive, administrative, and technical/structural metadata are all included in the schema, and a METS document will serve as the container for all of this information about a digital object.",
  title: "Mets",
  type: "object",
  properties: {
    path: {
      ...pathSchema,
      description: "Path to the file in the legacy preservation repository.",
    },
    md5: {
      type: "string",
      description: "MD5 checksum.",
      pattern: "^[0-9a-f]{32}$",
    },
  },
} as unknown as JSONSchemaType<Mets>);
