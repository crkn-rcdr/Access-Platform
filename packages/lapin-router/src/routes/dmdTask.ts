import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { DMDFORMATS, Slug, User } from "@crkn-rcdr/access-data";

const NewInput = z.object({
  user: User,
  format: z.enum(DMDFORMATS),
  file: z.string(), // any othervalidation needed?
  fileName: z.string(), // any othervalidation needed?
});

const FetchInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(), // array index of the item you want to fetch
  type: z.enum(["xml", "json"]), // type of attachment to return
});

const StoreInput = z.object({
  task: z.string(), // dmdtask uuid
  user: User,
  items: z.array(Slug),
  destination: z.enum(["access", "preservation"]),
});

const ResetInput = z.object({
  task: z.string(), // dmdtask uuid
  user: User,
});

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
  .query("list", {
    async resolve({ ctx }) {
      try {
        const q = {
          _id: {
            $ne: "_design/access",
          },
        };
        return await ctx.couch.dmdtask.find(q, null, { limit: 200 });
      } catch (e: any) {
        console.log("err", e?.message);
        throw httpErrorToTRPC(e);
      }
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
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("delete", {
    input: z.string(),
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.delete({ document: input });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("store", {
    input: StoreInput,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.store(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("resetStorageResult", {
    input: ResetInput,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.resetStorageResult(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("updateStorageResults", {
    input: z.object({
      id: z.string(), // dmdtask uuid
      array: z.array(z.any()),
    }),
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.update({
          ddoc: "access",
          name: "updateStorageResults",
          docId: input.id,
          body: input.array,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
