import { JSONSchemaType } from "ajv";
import Schema from "../Schema";
import { Timestamp, schema as timestampSchema } from "../Format/Timestamp";

/**
 * An object that describes a request for and the output of an automated process that is applied to the parent access object.
 */
export interface ProcessUpdate {
  requestDate: Timestamp;
  processDate?: Timestamp;
  succeeded?: boolean;
  message?: string;
}

export const schema = new Schema({
  $id: "/util/processUpdate.json",
  title: "Process update",
  type: "object",
  properties: {
    requestDate: timestampSchema.inline,
    processDate: { ...timestampSchema.inline, nullable: true },
    succeeded: { type: "boolean", nullable: true },
    message: { type: "string", nullable: true },
  },
  required: ["requestDate"],
  additionalProperties: false,
} as JSONSchemaType<ProcessUpdate>);
