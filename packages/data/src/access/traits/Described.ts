import { z } from "zod";
import { Noid } from "../../util/Noid.js";
import { Slug } from "../../util/Slug.js";
import { TextRecord } from "../util/TextRecord.js";

export const DMDType = z.enum(["dc", "marc", "issueinfo"]);

/**
 * Trait corresponding to any access object described by metadata.
 */
export const Described = z.object({
  /**
   * Human-readable identifier used to retrieve this object. Any such object
   * without a slug will not be retrievable without access to the object's
   * Noid.
   *
   * This will no longer be optional in the near future.
   */
  slug: Slug.optional(),

  /**
   * Slugs that also identify this object.
   */
  extraSlugs: z.array(Slug).optional(),

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
  memberships: z
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
