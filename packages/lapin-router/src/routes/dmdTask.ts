import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import {
  DMDFORMATS,
  ObjectListHandler,
  ShortTask,
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
        if ("items" in response.doc && Array.isArray(response.doc["items"])) {
          totalItems = response.doc["items"].length;
          totalPages = totalItems > 0 ? Math.ceil(totalPages / totalItems) : 0;
          const items = new ObjectListHandler(response.doc["items"]);
          const pageData = items.page(1, 100);
          response.doc.items = pageData.list;
        }

        const typeInfo: ShortTask | null = await ctx.couch.dmdtask.getShort(id);
        console.log(typeInfo);

        return {
          task: response.doc,
          totalItems,
          totalPages,
          type: typeInfo ? typeInfo.type : "N/A",
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
  .query("progress", {
    input: z.string(),
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.getProgress(input);
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
        const fileName = input.type === "json" ? "flatten.json" : "dmd.json";
        const jsonData = await ctx.couch.dmdtask.getAttachmentAsJSON({
          document: input.task,
          attachment: fileName,
        });
        console.log(jsonData);
        if (Array.isArray(jsonData) && input.index < jsonData.length)
          return jsonData[input.index];
        else return null;
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
            workProgress: 0,
            workSize: 2,
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
  })
  .mutation("bulkLookup", {
    input: z.object({
      id: z.string(), // dmdtask uuid
      destination: z.enum(["access", "preservation"]),
      prefix: z.string(),
      returnPage: z.number(),
      user: User,
    }),
    async resolve({ input, ctx }) {
      try {
        const { id, prefix, destination, returnPage, user } = input;
        const response: any = await ctx.couch.dmdtask.getSafe(id);

        if (response.doc?.["items"]) {
          const task: any = response.doc;
          let ids = [];
          for (let item of task.items) {
            const oldPrefixCheck = item.id.split(".");

            if (oldPrefixCheck.length)
              item.id = item.id.replace(`${oldPrefixCheck[0]}.`, "");

            item.id = prefix === "none" ? item.id : `${prefix}.${item.id}`;

            ids.push(item.id);
          }

          let foundIDs: any[] = [];
          if (destination === "access") {
            //ids
            const list = await ctx.couch.access.view("access", "slug", {
              keys: ids,
            });
            console.log("list", list);
            foundIDs = list.rows.map((row: any) => row.key);
          } else {
            const list = await ctx.couch.wipmeta.bulkLookup(ids);
            console.log("list", list);
            foundIDs = list.rows
              .filter((row: any) => "id" in row)
              .map((row: any) => row.key);
          }

          let numNotFound = 0;

          for (let item of task.items) {
            if (foundIDs.includes(item.id)) {
              item.found = true;
              if (item.parsed) item.shouldStore = true;
            } else {
              item.shouldStore = false;
              item.found = false;
              numNotFound++;
            }
          }

          await ctx.couch.dmdtask.update({
            ddoc: "access",
            name: "editObject",
            docId: id,
            body: {
              data: { items: task.items },
              user,
            },
          });

          const items = new ObjectListHandler(task.items);
          const pageData = items.page(returnPage, 100);
          return { pageData, numNotFound };
        }
        return {
          first: null,
          last: null,
          list: [],
        };
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("setItemShouldUpdate", {
    input: z.object({
      id: z.string(), //dmdtask id
      index: z.number(), // dmdtask index in items array
      value: z.boolean(),
    }),
    async resolve({ input, ctx }) {
      try {
        const { id, index, value } = input;
        return await ctx.couch.dmdtask.update({
          ddoc: "access",
          name: "setItemShouldUpdate",
          docId: id,
          body: { index, value },
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("setDestination", {
    input: z.object({
      id: z.string(), //dmdtask id
      destination: z.enum(["access", "preservation"]),
      user: User,
    }),
    async resolve({ input, ctx }) {
      try {
        const { id, destination, user } = input;
        return await ctx.couch.dmdtask.update({
          ddoc: "access",
          name: "editObject",
          docId: id,
          body: {
            data: { destination },
            user,
          },
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
