import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import {
  StoreAccessInput,
  storeAccess,
  NewInput,
  FetchInput,
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
    input: (input) => {
      try {
        NewInput.parse(input);
        return input;
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Code 1. Please contact the platform team for assistance.`,
        });
      }
    },
    async resolve({ input, ctx }) {
      try {
        let typed = input as NewInput;
        return await ctx.couch.dmdtask.create(typed);
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Code 2. Please try uploading the file again. If multiple file uploads fail throughout the day, this signifies a system error, and the Platform team needs to be notified.`,
        });
      }
    },
  })
  .mutation("storeAccess", {
    input: StoreAccessInput.parse,
    async resolve({ input, ctx }) {
      const { user, task, index, slug } = input;
      // Throws user-readable TRPC errors for specific issues
      await storeAccess(ctx, user, task, index, slug);
    },
  });
