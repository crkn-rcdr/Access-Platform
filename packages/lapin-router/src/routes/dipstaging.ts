import { z } from "zod";

import { createRouter, httpErrorToTRPC } from "../router.js";
import { Slug } from "@crkn-rcdr/access-data";

/*const ListFromKeys = z.object({
  slugs: z.array(Slug),
});*/

export const dipstagingRouter = createRouter().query("listFromKeys", {
  input: z.array(Slug).parse,
  async resolve({ input, ctx }) {
    try {
      return await ctx.couch.dipstaging.listFromKeys(input, ctx.couch.access);
    } catch (e) {
      console.log(e?.message);
      throw httpErrorToTRPC(e);
    }
  },
});
