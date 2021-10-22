import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import {
  FetchInput,
  NewInput,
  StoreAccessInput,
  storeAccess,
} from "../util/dmdTask.js";

export const dmdTaskRouter = createRouter()
  .query("get", {
    input: z.string(),
    async resolve({ input: id, ctx }) {
      const response = await ctx.couch.dmdtask.getSafe(id);
      if (response.found) return response.doc;
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No dmd task with id ${id} found.`,
      });
    },
  })
  .query("find", {
    input: z.string(),
    async resolve({ input: id, ctx }) {
      const fields = [
        "id",
        "user",
        "format",
        "process",
        "updated",
        "items",
        "fileName",
      ] as const;
      return await ctx.couch.dmdtask.findUnique("id", id, fields);
    },
  })
  .mutation("fetchResult", {
    input: FetchInput.parse,
    async resolve({ input, ctx }) {
      /*
       Fetches the attachment in the dmdtask document 
       and returns its contents. 
       Results should be decoded in the browser.
      */
      try {
        return input.type === "json"
          ? await ctx.couch.dmdtask.getAttachmentAsJSON({
              document: input.task,
              attachment: `${input.index}.${input.type}`,
            })
          : (
              await ctx.couch.dmdtask.getAttachment({
                document: input.task,
                attachment: `${input.index}.${input.type}`,
              })
            ).toString();
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
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
    async resolve({ input, ctx }) {
      const { user, task, index, slug } = input;
      console.log("access input: ", input);
      // Throws user-readable TRPC errors for specific issues
      await storeAccess(ctx, user, task, index, slug);
    },
  });
