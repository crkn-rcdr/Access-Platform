import { z } from "zod";
import { Slug } from "@crkn-rcdr/access-data";

import { createRouter } from "../router.js";

const SlugArray = z.array(Slug);

export const wipmetaRouter = createRouter().mutation("resolveMany", {
  input: SlugArray.parse,
  async resolve({ input, ctx }) {
    return await ctx.couch.wipmeta.findUniqueArray("id", input, [
      "id",
    ] as const);
  },
});
