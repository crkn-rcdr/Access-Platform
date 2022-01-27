import { z } from "zod";
import { mangoStringRangeSelector } from "@crkn-rcdr/couch-utils";
import { Noid, Slug, AccessObjectType } from "@crkn-rcdr/access-data";

import { createRouter } from "../router.js";

type SlugResult = {
  id: Noid;
  slug: Slug;
  type: AccessObjectType;
};
const SlugArray = z.array(Slug);
const StringArray = z.array(z.string());

export const slugRouter = createRouter()
  .query("search", {
    input: Slug.parse,
    async resolve({ input: q, ctx }): Promise<SlugResult[]> {
      const selector = mangoStringRangeSelector("slug", q);
      const fields = ["id", "slug", "type"] as const;
      return (await ctx.couch.access.find(selector, fields)) as SlugResult[];
    },
  })
  .query("resolve", {
    input: Slug.parse,
    async resolve({ input: q, ctx }) {
      return await ctx.couch.access.findUnique("slug", q, [
        "id",
        "type",
      ] as const);
    },
  })
  .mutation("resolveMany", {
    input: SlugArray.parse,
    async resolve({ input, ctx }) {
      return await ctx.couch.access.findUniqueArray("slug", input, [
        "id",
        "type",
      ] as const);
    },
  })
  .mutation("lookupMany", {
    input: StringArray.parse,
    async resolve({ input, ctx }) {
      return await ctx.couch.access.findUniqueArray("slug", input, [
        "id",
        "type",
        "slug",
      ] as const);
    },
  });
