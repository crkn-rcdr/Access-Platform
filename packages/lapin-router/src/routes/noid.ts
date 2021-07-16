import { Noid } from "@crkn-rcdr/access-data";
import { createRouter } from "../router.js";

export const noidRouter = createRouter()
  .query("search", {
    input: Noid.parse,
    async resolve({ input: q, ctx }): Promise<any[]> {
      const response = await ctx.couch.access.find({
        selector: {
          _id: { $eq: q },
        },
      });

      return response;
    },
  })
  .query("resolve", {
    input: Noid.parse,
    async resolve({ input: q, ctx }): Promise<any> {
      const response = await ctx.couch.access.find({
        selector: {
          _id: { $eq: q },
        },
        limit: 1,
      });

      return response.length ? response[0] : null;
    },
  });
