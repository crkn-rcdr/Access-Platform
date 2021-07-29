import { Noid } from "@crkn-rcdr/access-data";
import { createRouter } from "../router.js";

export const noidRouter = createRouter().query("resolve", {
  input: Noid.parse,
  async resolve({ input: id, ctx }) {
    return await ctx.couch.access.getSafe(id);
  },
});
