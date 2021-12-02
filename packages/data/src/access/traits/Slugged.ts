import { z } from "zod";

import { Slug } from "../../util/Slug.js";

/**
 * Trait for any access object that can have a Slug assigned to it.
 */
export const Slugged = z.object({
  /**
   * Human-readable identifier used to retrieve this object.
   */
  slug: Slug,
});
