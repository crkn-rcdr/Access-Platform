import { JSONSchemaType } from "ajv";
import { UnixFilePath, inline as pathSchema } from "../format/unixFilePath";
import { generateSchema } from "../validator";

/**
 * Reference to a stored file. The location of the file will either be
 * determined by the `path` property, the `extension` property, or the
 * field's key.
 */
export type FileRef = {
  /**
   * Path to the file in the legacy preservation repository.
   */
  path?: UnixFilePath;
  /**
   * File extension for something referenced in the access object store.
   */
  extension?: string;
  /**
   * Size of the file, in bytes.
   */
  size: number;
  /**
   * RFC 2046 Media Type (formerly MIME).
   */
  mime?: string;
  /**
   * MD5 checksum.
   */
  md5?: string;
};

export const { inline, schema, validate } = generateSchema<FileRef>({
  $id: "/util/FileRef",
  $comment:
    "Reference to a stored file. The location of the file will either be determined by the `path` property, the `extension` property, or the field's key.",
  title: "File Reference",
  type: "object",
  properties: {
    path: {
      ...pathSchema,
      nullable: true,
      description: "Path to the file in the legacy preservation repository.",
    },
    extension: {
      type: "string",
      minLength: 1,
      nullable: true,
      description:
        "File extension for something referenced in the access object store.",
    },
    size: { type: "number", minimum: 0 },
    mime: {
      type: "string",
      pattern: "^\\w+/\\w+$",
      nullable: true,
      description: "Size of the file, in bytes.",
    },
    md5: {
      type: "string",
      pattern: "^[0-9a-f]{32}$",
      nullable: true,
      description: "MD5 checksum.",
    },
  },
  required: ["size"],
  not: {
    required: ["path", "extension"],
  },
} as JSONSchemaType<FileRef>);