import { Noid, Slug } from "@crkn-rcdr/access-data";
import { createRouter } from "../router.js";

export const slugRouter = createRouter()
  .query("search", {
    input: Slug.parse,
    async resolve({ input: q, ctx }): Promise<any[]> {
      const response = await ctx.couch.access.find({
        selector: {
          slug: { $gt: q, $lt: q + "\ufff0" },
        },
        fields: ["_id", "slug"],
      });
      return response.map((record) => {
        return { noid: record._id as Noid, slug: record["slug"] as Slug };
      });
    },
  })
  .query("resolve", {
    input: Slug.parse,
    async resolve({ input: q, ctx }): Promise<any> {
      const response = await ctx.couch.access.find({
        selector: {
          slug: { $eq: q },
        },
        fields: ["_id", "slug"],
      });
      console.log(response);

      return response.length
        ? { noid: response?.[0]?._id, slug: response?.[0]?.["slug"] }
        : null;
    },
  })
  .query("resolveMany", {
    // Docs: https://trpc.io/docs/quickstart
    input: (val: unknown) => {
      if (!Array.isArray(val)) return false;
      for (let slug of val) {
        Slug.parse(slug); // test each slug, throw error if issue
      }
      return true;
    },
    async resolve({ input: q, ctx }): Promise<[Noid, Slug][]> {
      const response = await ctx.couch.access.find({
        selector: {
          slug: { $in: q },
        },
        fields: ["_id", "slug"],
      });
      return response.map((record) => [
        record._id as Noid,
        record["slug"] as Slug,
      ]);
    },
  });
