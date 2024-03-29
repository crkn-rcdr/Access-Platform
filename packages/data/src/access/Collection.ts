import { z } from "zod";
import { AccessObjectTrait } from "./AccessObject.js";
import {
  AccessObjectList,
  ObjectListHandler,
  ObjectListShort,
} from "./util/ObjectList.js";

export const Collection = z
  .object({
    type: z.enum(["collection"]),

    /**
     * Semantics about the nature of the collection's members list.
     * `unordered` members have no connection to each other,
     * `individuals` are in a meaningful order but the end of one does not
     * link into the beginning of the other, and `multi-part` members are parts
     * of one cohesive whole. If that was too vague, use `unordered` for
     * thematic or project collections, and `multi-part` for serials.
     */
    behavior: z.enum(["unordered", "individuals", "multi-part"]),

    /**
     * The list of members of this collection.
     */
    members: AccessObjectList,
  })
  .merge(AccessObjectTrait);

export type Collection = z.infer<typeof Collection>;

/**
 * The staff-editable properties of a Collection.
 */
export const EditableCollection = Collection.pick({
  slug: true,
  label: true,
  summary: true,
  behavior: true,
  members: true,
  dmdType: true,
})
  .partial()
  .refine(
    (obj) => Object.keys(obj).length > 0,
    "Cannot edit a collection with an empty object"
  );

export type EditableCollection = z.infer<typeof EditableCollection>;

/**
 * The properties of a newly created Collection.
 */
export const NewCollection = Collection.pick({
  slug: true,
  label: true,
  behavior: true,
  members: true,
  summary: true,
  type: true,
}).refine(
  (obj) => Object.keys(obj).length > 0,
  "Cannot edit a collection with an empty object"
);

export type NewCollection = z.infer<typeof NewCollection>;

export const PagedCollection = Collection.omit({ members: true }).merge(
  z.object({
    members: ObjectListShort,
  })
);

export type PagedCollection = z.infer<typeof PagedCollection>;

export const toPagedCollection = (c: Collection): PagedCollection => {
  const handler = new ObjectListHandler(c.members);
  return {
    ...c,
    members: handler.shortForm(),
  };
};
