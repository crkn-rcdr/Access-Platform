import { TRPCError } from "@trpc/server";
import { Noid } from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";

export const accessObjectRouter = createRouter()
  .query("get", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) return response.doc;
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
    },
  })
  .mutation("publish", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      try {
        return await ctx.couch.access.publish(id);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("unpublish", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      try {
        return await ctx.couch.access.unpublish(id);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
