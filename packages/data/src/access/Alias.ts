import { z } from "zod";
import { Slug } from "../util/Slug.js";
import { Identified } from "./traits/Identified.js";
import { Slugged } from "./traits/Slugged.js";

/**
 * An access object that specifies that its Slug should point to
 * a different Slug.
 */
export const Alias = z
  .object({
    type: z.enum(["alias"]),

    /**
     * The slug that this Alias points to.
     * n.b. this used to be a Noid, but I think a Slug is more appropriate.
     * 1. The imagined main use case for this will be to handle Slug misspellings.
     * 2. Why keep track of a Noid that might get thrown away later?
     */
    to: Slug,
  })
  .merge(Identified)
  .merge(Slugged);

export type Alias = z.infer<typeof Alias>;

/**
 * The staff-editable properites of an Alias.
 */
export const EditableAlias = Alias.pick({
  slug: true,
  to: true,
});

export type EditableAlias = z.infer<typeof EditableAlias>;
