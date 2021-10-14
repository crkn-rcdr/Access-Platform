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
    id: Noid,

    /**
     * The object's label in this list's context.
     */
    label: TextRecord.optional(),
  })
);

export type ObjectList = z.infer<typeof ObjectList>;

export const ObjectListShort = z
  .object({
    first: Noid,
    last: Noid,
    count: z.number().int().positive(),
  })
  .nullable();

export type ObjectListShort = z.infer<typeof ObjectListShort>;

export const ObjectListPage = z.object({
  first: Noid.nullable(),
  last: Noid.nullable(),
  list: ObjectList,
});

export type ObjectListPage = z.infer<typeof ObjectListPage>;

const pageFrom = (list: ObjectList): ObjectListPage => {
  return {
    first: list[0]?.id || null,
    last: list[list.length - 1]?.id || null,
    list,
  };
};

export class ObjectListHandler {
  private list: ObjectList;

  constructor(list: ObjectList) {
    this.list = list;
  }

  length() {
    return this.list.length;
  }

  shortForm(): ObjectListShort {
    if (this.list.length > 0) {
      return {
        first: this.list[0]?.id as string,
        last: this.list[this.length() - 1]?.id as string,
        count: this.length(),
      };
    } else {
      return null;
    }
  }

  nextPage(after: Noid | null, limit: number): ObjectListPage {
    if (after) {
      const index = this.list.findIndex((obj) => obj.id === after);
      if (index === -1) {
        return pageFrom([]);
      } else {
        return pageFrom(this.list.slice(index + 1, index + 1 + limit));
      }
    } else {
      return pageFrom(this.list.slice(0, limit));
    }
  }

  previousPage(before: Noid | null, limit: number): ObjectListPage {
    if (before) {
      const index = this.list.findIndex((obj) => obj.id === before);
      if (index === -1) {
        return pageFrom([]);
      } else {
        return pageFrom(this.list.slice(Math.max(0, index - limit), index));
      }
    } else {
      return pageFrom(
        this.list.slice(Math.max(0, this.length() - limit), this.length())
      );
    }
  }
}
