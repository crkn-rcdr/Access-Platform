import { JSONSchemaType } from "ajv";
import { generateSchema } from "../validator";
import { Timestamp, inline as timestampSchema } from "../Format/Timestamp";

/**
 * An object that describes a request for and the output of an automated process that is applied to the parent access object.
 */
export type ProcessUpdate = {
  requestDate: Timestamp;
  processDate?: Timestamp;
  succeeded?: boolean;
  message?: string;
};

export const { inline, schema, validate } = generateSchema({
  $id: "/util/processUpdate",
  title: "Process update",
  type: "object",
  properties: {
    requestDate: timestampSchema,
    processDate: { ...timestampSchema, nullable: true },
    succeeded: { type: "boolean", nullable: true },
    message: { type: "string", nullable: true },
  },
  required: ["requestDate"],
  additionalProperties: false,
} as JSONSchemaType<ProcessUpdate>);
