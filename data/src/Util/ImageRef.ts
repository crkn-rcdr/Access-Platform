import { JSONSchemaType } from "ajv";
import { FileRef, schema as fileRefSchema } from "./FileRef";
import { ProcessUpdate, schema as processUpdateSchema } from "./ProcessUpdate";

const EXTENSIONS = ["jpg", "jp2", "jpeg", "tif", "tiff"];
const MEDIA_TYPES = ["image/jpeg", "image/jp2", "image/tiff"];

export interface Local {
  /**
   * Image file extension. Supported: "jpeg", "jpg", "jp2", "tif", "tiff"
   */
  extension?: typeof EXTENSIONS[number];
  /**
   * RFC 2046 Media Type (formerly MIME). Supported: "image/jpeg", "image/jp2", "image/tiff"
   */
  mime: typeof MEDIA_TYPES[number];
  /**
   * Image height, in pixels.
   */
  height?: number;
  /**
   * Image width, in pixels.
   */
  width?: number;
  /**
   * Update for the service that supplies dimension information.
   */
  update?: ProcessUpdate;
}

/**
 * Reference to a stored image.
 */
export interface ImageRef extends Omit<FileRef, "extension" | "mime">, Local {}

export const schema = fileRefSchema.mergeInto({
  $id: "/util/image.json",
  title: "Image file reference",
  type: "object",
  properties: {
    extension: { type: "string", enum: EXTENSIONS, nullable: true },
    mime: { type: "string", enum: MEDIA_TYPES },
    height: { type: "integer", minimum: 0, nullable: true },
    width: { type: "integer", minimum: 0, nullable: true },
    update: { ...processUpdateSchema.inline, nullable: true },
  },
  required: ["mime"],
  dependencies: { height: ["width"], width: ["height"] },
  oneOf: [{ required: ["path"] }, { required: ["extension"] }],
} as JSONSchemaType<Local>);
