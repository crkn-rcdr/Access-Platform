import { z } from "zod";
import { Slug } from "../../util/Slug";
import { TextRecord } from "./TextRecord.js";

/**
 * A list of references to access objects, including an optional label
 * for the object in the context of this list.
 */
export const SlugList = z.array(
  z.object({
    /**
     * The object's Noid.
     */
    slug: Slug.optional(),

    /**
     * The object's label in this list's context.
     */
    label: TextRecord.optional(),
  })
);

export type SlugList = z.infer<typeof SlugList>;
