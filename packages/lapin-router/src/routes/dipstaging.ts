import { z } from "zod";

import { createRouter, httpErrorToTRPC } from "../router.js";
import { Slug } from "@crkn-rcdr/access-data";

const ListFromKeys = z.object({
  slug: z.array(Slug),
});

export const dipstagingRouter = createRouter().query("listFromKeys", {
  input: ListFromKeys.parse,
  async resolve({ input, ctx }) {
    try {
      return await ctx.couch.dipstaging.listFromKeys(
        input.slug,
        ctx.couch.access
      );
    } catch (e) {
      console.log(e?.message);
      throw httpErrorToTRPC(e);
    }
  },
});
