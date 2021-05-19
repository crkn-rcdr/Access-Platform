import { JSONSchemaType } from "ajv";
import { Root, schema as rootSchema } from "./Root";
import { FileRef, inline as fileRefSchema } from "../util/FileRef";
import { ImageRef, inline as imageRefSchema } from "../util/ImageRef";
import { UnixFilePath, inline as pathSchema } from "../format/unixFilePath";
import { inherit } from "../validator";

const TAKEDOWNS = ["copyright", "privacy"];
const OCR_TYPES = ["alto", "txtmap"];

/**
 * Source information for an image in the legacy preservation repository.
 */
type CIHMSource = {
  from: "cihm";
  /** Legacy repository path. */
  path: UnixFilePath;
};

/**
 * Source information for an image in Archivematica.
 */
type AMSource = {
  from: "am";
  aipId: string;
  objId: string;
};

type CanvasSpec = {
  /**
   * Information about the preservation source of this base image of this canvas.
   */
  source: CIHMSource | AMSource;

  /**
   * Reference to the base image file.
   */
  master: ImageRef;

  /**
   * If the canvas has been taken down from public view, this is the reason why.
   */
  takedown?: typeof TAKEDOWNS[number];

  /**
   * Reference to the PDF file generated by OCR.
   */
  ocrPdf?: FileRef;

  /**
   * OCR XML type. One of `alto` or `txtmap`.
   */
  ocrType?: typeof OCR_TYPES[number];

  /**
   * As time goes on or errors take place, some canvases may no longer be
   * referenced by a manifest. These canvases may be marked as orphans by setting
   * this flag.
   */
  orphan?: boolean;
};

/**
 * The virtual representation of the space taken up by a page of a Manifest.
 */
export type Canvas = Root & CanvasSpec;

const specSchema = {
  $id: "/access/Canvas",
  title: "Canvas",
  type: "object",
  description:
    "The virtual representation of the space taken up by a page of a Manifest.",
  properties: {
    source: {
      description:
        "Information about the preservation source of this base image of this canvas.",
      type: "object",
      oneOf: [
        {
          description:
            "Source information for an image in the legacy preservation repository.",
          properties: {
            from: { type: "string", const: "cihm" },
            path: { ...pathSchema, description: "Legacy repository path." },
          },
          required: ["from", "path"],
          additionalProperties: false,
        },
        {
          description: "Source information for an image in Archivematica.",
          properties: {
            from: { type: "string", const: "cihm" },
            aipId: { type: "string" },
            objId: { type: "string" },
          },
          required: ["from", "aipId", "objId"],
          additionalProperties: false,
        },
      ],
      required: ["from"],
    },
    master: {
      ...imageRefSchema,
      description: "Reference to the base image file.",
    },
    takedown: {
      description:
        "If the canvas has been taken down from public view, this is the reason why.",
      type: "string",
      enum: TAKEDOWNS,
      nullable: true,
    },
    ocrPdf: {
      ...fileRefSchema,
      nullable: true,
      description: "Reference to the PDF file generated by OCR.",
    },
    ocrType: {
      description: "OCR XML type.",
      type: "string",
      enum: OCR_TYPES,
      nullable: true,
    },
    orphan: {
      description:
        "As time goes on or errors take place, some canvases may no longer be referenced by a manifest. These canvases may be marked as orphans by setting this flag.",
      type: "boolean",
      default: false,
      nullable: true,
    },
  },
  required: ["master", "source"],
} as JSONSchemaType<CanvasSpec>;

export const { inline, schema, validate } = inherit<Canvas, Root, CanvasSpec>(
  rootSchema,
  specSchema,
  false
);