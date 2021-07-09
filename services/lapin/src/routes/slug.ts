import { Noid, Slug } from "@crkn-rcdr/access-data";
import { z } from "zod";
import { createRouter } from "../router.js";

export const slugRouter = createRouter().query("search", {
  input: z.object({ q: z.string() }),
  async resolve({ input, ctx }): Promise<[Noid, Slug][]> {
    const response = await ctx.drivers.couch.access.find({
      selector: {
        slug: { $gt: input.q, $lt: input.q + "\ufff0" },
      },
      fields: ["_id", "slug"],
    });

    return response.map((record) => [
      record._id as Noid,
      record["slug"] as Slug,
    ]);
  },
});
