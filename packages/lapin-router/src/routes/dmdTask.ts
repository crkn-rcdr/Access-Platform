import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import {
  DMDFORMATS,
  ObjectListHandler,
  Slug,
  User,
} from "@crkn-rcdr/access-data";

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
  prefix: z.string(),
  items: z.array(Slug),
  destination: z.enum(["access", "preservation"]),
});

const ResetInput = z.object({
  task: z.string(), // dmdtask uuid
  user: User,
});

const PageInput = z.object({
  id: z.string(),
  page: z.number().int().positive(),
  limit: z.number().int().positive().default(100),
});

/*
const PageAfterInput = z.object({
  id: z.string(),
  after: z.string().nullable(),
  limit: z.number().int().positive().default(100),
});

const PageBeforeInput = z.object({
  id: z.string(),
  before: z.string().nullable(),
  limit: z.number().int().positive().default(100),
});
*/

export const dmdTaskRouter = createRouter()
  .query("get", {
    input: z.string(),
    async resolve({ input: id, ctx }) {
      const response: any = await ctx.couch.dmdtask.getSafe(id);
      if (response.found) {
        let totalItems = 0;
        let totalPages = 0;
        console.log(response.doc);
        if ("items" in response.doc && Array.isArray(response.doc["items"])) {
          totalItems = response.doc["items"].length;
          totalPages = totalItems > 0 ? Math.ceil(totalPages / totalItems) : 0;
          const items = new ObjectListHandler(response.doc["items"]);
          const pageData = items.page(1, 100);
          response.doc.items = pageData.list;
        }
        return {
          task: response.doc,
          totalItems,
          totalPages,
        };
      }
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No dmd task with id ${id} found.`,
      });
    },
  })
  .query("list", {
    async resolve({ ctx }) {
      try {
        return await ctx.couch.dmdtask.getAll();
      } catch (e: any) {
        console.log("err", e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("page", {
    input: PageInput.parse,
    async resolve({ input: { id, page, limit }, ctx }) {
      const response = await ctx.couch.dmdtask.getSafe(id);
      if (response.found) {
        const task = response.doc;
        if (task && "items" in task && task.items) {
          const items = new ObjectListHandler(task.items);
          const pageData = items.page(page, limit);
          return pageData;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Object ${id} cannot be parsed.`,
        });
      }
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
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
  .mutation("pauseStorage", {
    input: ResetInput,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.pauseStorage(input);
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
          body: {
            array: input.array,
            workProgress: 2,
            workSize: 3,
          },
        });
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })

  .mutation("processArray", {
    input: z.object({
      id: z.string(), // dmdtask uuid
      array: z.array(z.any()),
    }),
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.update({
          ddoc: "access",
          name: "process",
          docId: input.id,
          body: {
            succeeded: true,
            items: input.array,
            message: "test",
          },
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("processDelete", {
    input: z.object({
      id: z.string(), // dmdtask uuid
    }),
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.update({
          ddoc: "access",
          name: "process",
          docId: input.id,
          body: {
            succeeded: true,
            items: "delete",
            message: "test",
          },
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
