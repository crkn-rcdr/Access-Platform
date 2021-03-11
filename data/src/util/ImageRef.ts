import { JSONSchemaType } from "ajv";
import { ProcessUpdate, inline as processUpdateSchema } from "./ProcessUpdate";
import { UnixFilePath, inline as pathSchema } from "../format/UnixFilePath";
import { generateSchema } from "../validator";

const EXTENSIONS = ["jpg", "jp2", "jpeg", "tif", "tiff"];
const MEDIA_TYPES = ["image/jpeg", "image/jp2", "image/tiff"];

/**
 * Reference to a stored image, which can be found in either the legacy preservation
 * repository or the access platform file store.
 */
export type ImageRef = {
  /**
   * Path to the file in the legacy preservation repository.
   */
  path?: UnixFilePath;
  /**
   * Image file extension. Supported: "jpeg", "jpg", "jp2", "tif", "tiff"
   */
  extension?: typeof EXTENSIONS[number];
  /**
   * Size of the file, in bytes.
   */
  size: number;
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
};

export const { inline, schema, validate } = generateSchema<ImageRef>({
  $id: "/util/image",
  title: "Image file reference",
  type: "object",
  properties: {
    path: { ...pathSchema, nullable: true },
    extension: { type: "string", enum: EXTENSIONS, nullable: true },
    size: { type: "number", minimum: 0 },
    mime: { type: "string", enum: MEDIA_TYPES },
    height: { type: "integer", minimum: 0, nullable: true },
    width: { type: "integer", minimum: 0, nullable: true },
    update: { ...processUpdateSchema, nullable: true },
  },
  required: ["mime"],
  dependencies: { height: ["width"], width: ["height"] },
  oneOf: [{ required: ["path"] }, { required: ["extension"] }],
} as JSONSchemaType<ImageRef>);
