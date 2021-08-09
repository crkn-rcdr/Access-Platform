import { z } from "zod";
import { mangoStringRangeSelector } from "@crkn-rcdr/couch-utils";
import { Noid, Slug } from "@crkn-rcdr/access-data";

import { createRouter } from "../router.js";

type SlugResult = {
  id: Noid;
  slug: Slug;
};

const SlugArray = z.array(Slug);

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
      return await ctx.couch.access.findUnique("slug", q, ["id", "type"]);
    },
  })
  .query("resolveMany", {
    input: SlugArray.parse,
    async resolve({ input: q, ctx }) {
      return await ctx.couch.access.findUniqueArray("slug", q, ["id", "type"]);
    },
  });
