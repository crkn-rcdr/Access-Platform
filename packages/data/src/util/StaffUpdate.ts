import { JSONSchemaType } from "ajv";
import { Timestamp, inline as timestampSchema } from "./Timestamp";
import { User, inline as userSchema } from "./User";
import { generateSchema } from "../validator";

/**
 * Represents data for when a staff member 9user) updates an object, and when they had done so.
 */
export type StaffUpdate = {
  /**
   * The user who has performed the update.
   */
  by: User;

  /**
   * A timestamp showing when the user performed the update.
   */
  date: Timestamp;
};

export const { inline, schema, validate } = generateSchema<StaffUpdate>({
  $id: "/util/StaffUpdate",
  $comment: "Represents data for when a staff member 9user) updates an object, and when they had done so.",
  title: "StaffUpdate",
  type: "object",
  properties: {
    by: {
      ...userSchema,
      description: "The user who has performed the update.",
    },
    date: {
      ...timestampSchema,
      description: "A timestamp showing when the user performed the update.",
    },
  },
  required: ["by", "date"],
} as JSONSchemaType<StaffUpdate>);
