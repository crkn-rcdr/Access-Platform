import { z } from "zod";
import { Timestamp } from "./Timestamp.js";
import { User } from "./User.js";

/**
 * A record of the most recent update to an object performed by staff.
 */
export const StaffUpdate = z.object({
  /**
   * The staff member who performed the update.
   */
  by: User,

  /**
   * The time the update was registered.
   */
  date: Timestamp,
});

export type StaffUpdate = z.infer<typeof StaffUpdate>;
