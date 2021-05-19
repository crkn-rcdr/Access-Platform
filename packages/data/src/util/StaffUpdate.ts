import { JSONSchemaType } from "ajv";
import { Timestamp, inline as timestampSchema } from "./Timestamp";
import { User, inline as userSchema } from "./User";
import { generateSchema } from "../validator";

/**
 *
 */
export type StaffUpdate = {
  by: User;
  date: Timestamp;
};

export const { inline, schema, validate } = generateSchema<StaffUpdate>({
  $id: "/util/StaffUpdate",
  $comment: "",
  title: "",
  type: "object",
  properties: {
    by: {
      ...userSchema,
      description: "",
      $comment: "",
    },
    date: {
      ...timestampSchema,
      description: "",
    },
  },
  required: ["by", "date"],
} as JSONSchemaType<StaffUpdate>);
