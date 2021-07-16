import { Noid, Slug } from "@crkn-rcdr/access-data";
import { createRouter } from "../router.js";

export const slugRouter = createRouter().query("search", {
  input: Slug.parse,
  async resolve({ input: q, ctx }): Promise<[Noid, Slug][]> {
    const response = await ctx.couch.access.find({
      selector: {
        slug: { $gt: q, $lt: q + "\ufff0" },
      },
      fields: ["_id", "slug"],
    });

    return response.map((record) => [
      record._id as Noid,
      record["slug"] as Slug,
    ]);
  },
});
