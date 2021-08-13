import { z } from "zod";
import { MDTYPES, User, Slug } from "@crkn-rcdr/access-data";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";

const NewInput = z.object({
  user: User,
  mdType: z.enum(MDTYPES), //"csvissueinfo" | "csvdc" | "marc490" | "marcoocihm" | "marcooe";
  file: z.string(), // any othervalidation needed?
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
  });
