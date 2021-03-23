import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";
import { Timestamp, inline as timestampSchema } from "../util/Timestamp";

/**
 * An object that describes a request for and the output of an automated
 * process that is applied to the parent object.
 */
export type ProcessUpdate = {
  /**
   * Most recent request time for the automated process to run.
   */
  requestDate: Timestamp;

  /**
   * Most recent time the process update took place.
   */
  processDate?: Timestamp;

  /**
   * Whether the last process was run successfully on this object.
   */
  succeeded?: boolean;

  /**
   * Error message supplied by the process.
   */
  message?: string;
};

export const { inline, schema, validate } = generateSchema({
  $id: "/util/ProcessUpdate",
  title: "Process update",
  description:
    "An object that describes a request for and the output of an automated process that is applied to the parent object.",
  type: "object",
  properties: {
    requestDate: {
      ...timestampSchema,
      description: "Most recent request time for the automated process to run.",
    },
    processDate: {
      ...timestampSchema,
      description: "Most recent time the process update took place.",
    },
    succeeded: {
      type: "boolean",
      nullable: true,
      description:
        "Whether the last process was run successfully on this object.",
    },
    message: {
      type: "string",
      nullable: true,
      description: "Error message supplied by the process.",
    },
  },
  required: ["requestDate"],
  additionalProperties: false,
} as JSONSchemaType<ProcessUpdate>);
