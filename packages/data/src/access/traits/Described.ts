import { z } from "zod";

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
});
