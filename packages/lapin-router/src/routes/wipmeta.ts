import { z } from "zod";
import { Slug } from "@crkn-rcdr/access-data";

import { createRouter } from "../router.js";

const SlugArray = z.array(Slug);
const StringArray = z.array(z.string());

export const wipmetaRouter = createRouter()
  .mutation("resolveMany", {
    input: SlugArray.parse,
    async resolve({ input, ctx }) {
      return await ctx.couch.wipmeta.findUniqueArray("id", input, [
        "id",
      ] as const);
    },
  })
  .mutation("bulkLookup", {
    input: StringArray.parse,
    async resolve({ input, ctx }) {
      const list = await ctx.couch.wipmeta.bulkLookup(input);
      return list.rows
        .filter((row: any) => "id" in row)
        .map((row: any) => row.key);
    },
  });
