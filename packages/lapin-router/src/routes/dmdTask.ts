import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC, HTTPErrorLike } from "../router.js";
import {
  FetchInput,
  getAccessObjectForDmdTaskItem,
  getDmdItemXML,
  getDmdTaskItemByIndex,
  getDmdTaskItemXMLFileName,
  lookupDmdTaskForStorage,
  NewInput,
  StoreAccessInput,
  storeDmdTaskItemXmlFile,
  updateLabelForDmdTaskItemAccessObject,
} from "../util/dmdTask.js";
//import { RouteLimiter } from "../util/limiter.js";
//const limiter = new RouteLimiter();

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
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  })
  .mutation("create", {
    input: NewInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.create(input);
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  })
  .mutation("storeAccess", {
    input: StoreAccessInput.parse,
    async resolve({ input, ctx }) {
      try {
        const path = "storeAccess";
        return ctx.routeLimiter.queueBackgroundJob(path, async () => {
          // Each of these methods throws an error if the results arent what is expected.

          const dmdTask = await lookupDmdTaskForStorage(ctx, input.task);

          const itemXmlFile = await getDmdItemXML(ctx, input.task, input.index);

          const item = await getDmdTaskItemByIndex(dmdTask, input.index);

          const accessObject = await getAccessObjectForDmdTaskItem(
            ctx,
            input.slug
          );

          const itemXMLFileName = getDmdTaskItemXMLFileName(
            accessObject.id,
            item.output
          );

          await storeDmdTaskItemXmlFile(ctx, itemXMLFileName, itemXmlFile);

          // Should I add a length check?
          if (typeof item.label === "string") {
            await updateLabelForDmdTaskItemAccessObject(
              ctx,
              item.label,
              accessObject.id,
              input.user,
              accessObject.type
            );
          }
        });
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  });
