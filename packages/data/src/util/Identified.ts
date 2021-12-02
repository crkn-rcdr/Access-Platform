import { z } from "zod";

import { Noid } from "./Noid.js";
import { StaffUpdate } from "./StaffUpdate.js";
import { Timestamp } from "./Timestamp.js";

/**
 * Root trait for any access object.
 */
export const Identified = z.object({
  /**
   * This access object's Noid. It's a unique, opaque identifier.
   */
  id: Noid,

  /**
   * If set, the object was made available to the public at this time.
   * If unset, it is not available to the public.
   */
  public: Timestamp.optional(),

  /**
   * Timestamp for when this object was last updated.
   */
  updated: Timestamp.optional(),

  /**
   * Record of the most recent update performed by staff.
   */
  staff: StaffUpdate.optional(),
});
