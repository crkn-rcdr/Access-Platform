import { z } from "zod";
import { Noid } from "../../util/Noid.js";
import { TextRecord } from "./TextRecord.js";

/**
 * A list of references to access objects, including an optional label
 * for the object in the context of this list.
 */
export const ObjectList = z.array(
  z.object({
    /**
     * The object's Noid.
     */
    id: Noid.optional(),

    /**
     * The object's label in this list's context.
     */
    label: TextRecord.optional(),
  })
);

export type ObjectList = z.infer<typeof ObjectList>;
