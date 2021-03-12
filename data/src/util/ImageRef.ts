import { JSONSchemaType } from "ajv";
import { ProcessUpdate, inline as processUpdateSchema } from "./ProcessUpdate";
import { UnixFilePath, inline as pathSchema } from "../format/unixFilePath";
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
   * Image height, in pixels. Implies that `width` is defined.
   */
  height?: number;

  /**
   * Image width, in pixels. Implies that `height` is defined.
   */
  width?: number;

  /**
   * Update for the service that supplies dimension information.
   */
  update?: ProcessUpdate;
};

export const { inline, schema, validate } = generateSchema<ImageRef>({
  $id: "/util/ImageRef",
  $comment:
    "Reference to a stored image, which can be found in either the legacy preservation repository or the access platform file store.",
  title: "Image file reference",
  type: "object",
  properties: {
    path: {
      ...pathSchema,
      nullable: true,
      description: "Path to the file in the legacy preservation repository.",
      $comment: "Cannot be defined along with `extension`.",
    },
    extension: {
      type: "string",
      enum: EXTENSIONS,
      nullable: true,
      description: "Image file extension.",
      $comment: "Cannot be defined along with `path`.",
    },
    size: {
      type: "number",
      minimum: 0,
      description: "Size of the file, in bytes.",
    },
    mime: {
      type: "string",
      enum: MEDIA_TYPES,
      description: "RFC 2046 Media Type (formerly MIME).",
    },
    height: {
      type: "integer",
      minimum: 0,
      nullable: true,
      description: "Image height, in pixels.",
      $comment: "Implies that `width` is defined.",
    },
    width: {
      type: "integer",
      minimum: 0,
      nullable: true,
      description: "Image width, in pixels.",
      $comment: "Implies that `height` is defined.",
    },
    update: {
      ...processUpdateSchema,
      nullable: true,
      description:
        "Update for the service that supplies dimension information.",
    },
  },
  required: ["mime"],
  dependencies: { height: ["width"], width: ["height"] },
  oneOf: [{ required: ["path"] }, { required: ["extension"] }],
} as JSONSchemaType<ImageRef>);
