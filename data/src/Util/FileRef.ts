import { JSONSchemaType } from "ajv";
import Schema from "../Schema";
import { UriReference, schema as uriSchema } from "../Format/UriReference";

/**
 * Reference to a stored file. The location of the file will either be
 * determined by the `path` property, the `extension` property, or the
 * field's key.
 */
export interface FileRef {
  /**
   * Path to the file in the legacy preservation repository.
   */
  path?: UriReference;
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
}

export const schema = new Schema<FileRef>({
  $id: "/util/fileRef.json",
  title: "File Reference",
  type: "object",
  properties: {
    path: { ...uriSchema.inline, nullable: true },
    extension: { type: "string", minLength: 1, nullable: true },
    size: { type: "number", minimum: 0 },
    mime: { type: "string", pattern: "^\\w+/\\w+$", nullable: true },
    md5: { type: "string", pattern: "^[0-9a-f]{32}$", nullable: true },
  },
  required: ["size"],
  not: {
    required: ["path", "extension"],
  },
} as JSONSchemaType<FileRef>);
