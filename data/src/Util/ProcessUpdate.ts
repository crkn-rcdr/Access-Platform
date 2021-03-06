import { JSONSchemaType } from "ajv";
import Schema from "../Schema";
import DateTime, { format as dateTimeFormat } from "../Format/DateTime";

/**
 * An object that describes a request for and the output of an automated process that is applied to the parent access object.
 */
export default interface ProcessUpdate {
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
    requestDate: dateTimeFormat.schema.inline,
    processDate: { ...dateTimeFormat.schema.inline, nullable: true },
    succeeded: { type: "boolean", nullable: true },
    message: { type: "string", nullable: true },
  },
  required: ["requestDate"],
  additionalProperties: false,
} as JSONSchemaType<ProcessUpdate>);
