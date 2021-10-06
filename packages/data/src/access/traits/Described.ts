import { z } from "zod";
import { Noid } from "../../util/Noid.js";
import { TextRecord } from "../util/TextRecord.js";

export const DMDType = z.enum(["dc", "marc", "issueinfo"]);

/**
 * Trait corresponding to any access object described by metadata.
 */
export const Described = z.object({
  /**
   * Human-readable name or title.
   */
  label: TextRecord,

  /**
   * A short textual summary.
   */
  summary: TextRecord.optional(),

  /**
   * The type of descriptive metadata record associated with this resource.
   */
  dmdType: DMDType.optional(),

  /**
   * Array of memberships for this object.
   */
  membership: z
    .array(
      z.object({
        /** Noid of the collection this is a member of. */
        of: Noid,
        /** Order sequence */
        seq: z.number().int().positive().optional(),
        /** Optional member-context label */
        label: TextRecord.optional(),
      })
    )
    .optional(),
});
