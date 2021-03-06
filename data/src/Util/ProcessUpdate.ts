import { JSONSchemaType } from "ajv";
import Schema from "../Schema";
import { DateTime, schema as dateTimeSchema } from "../Format/DateTime";

/**
 * An object that describes a request for and the output of an automated process that is applied to the parent access object.
 */
export interface ProcessUpdate {
  requestDate: DateTime;
  processDate?: DateTime;
  succeeded?: boolean;
  message?: string;
}

export const schema = new Schema({
  $id: "/util/processUpdate.json",
  title: "Process update",
  type: "object",
  properties: {
    requestDate: dateTimeSchema.inline,
    processDate: { ...dateTimeSchema.inline, nullable: true },
    succeeded: { type: "boolean", nullable: true },
    message: { type: "string", nullable: true },
  },
  required: ["requestDate"],
  additionalProperties: false,
} as JSONSchemaType<ProcessUpdate>);
