import { z } from "zod";
import { DMDFORMATS, User, Slug } from "@crkn-rcdr/access-data";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";

const NewInput = z.object({
  user: User,
  format: z.enum(DMDFORMATS),
  file: z.string(), // any othervalidation needed?
});

const StoreAccessInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(), // array index of item whose metadata is being stored
  slug: z.string(), // prefix + id (we might not need this if we send the resolved noid)
  noid: z.string(), // result of slug lookup
});

export const dmdTaskRouter = createRouter()
  .query("get", {
    input: Slug.parse,
    async resolve({ input: id, ctx }) {
      const response = await ctx.couch.dmdtask.getSafe(id);
      if (response.found) return response.doc;
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No dmd task with id ${id} found.`,
      });
    },
  })
  .mutation("create", {
    input: NewInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.create(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("storeAccess", {
    input: StoreAccessInput.parse,
    async resolve() {
      //{ input, ctx }) {
      try {
        return true; //await ctx.couch;
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
