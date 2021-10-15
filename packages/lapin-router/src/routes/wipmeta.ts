import { z } from "zod";
import { createRouter, HTTPErrorLike, httpErrorToTRPC } from "../router.js";
import {
  getDmdItemXML,
  getDmdTaskItemByIndex,
  lookupDmdTaskForStorage,
} from "../util/dmdTask.js";
//import { RouteLimiter } from "../util/limiter.js";
//const limiter = new RouteLimiter();

export const StorePreservationInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(),
  id: z.string(), // = prefix.slug
});

export const wipmetaRouter = createRouter()
  .query("find", {
    input: z.string(), //Slug.parse,
    async resolve({ input: id, ctx }) {
      try {
        const response = await ctx.couch.wipmeta.list({
          key: id,
          limit: 1,
        });
        return response.rows.length === 1;
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  })
  .mutation("storePreservation", {
    input: StorePreservationInput.parse,
    async resolve({ input, ctx }) {
      try {
        const path = "storePreservation";
        ctx.limiter.queueJob(path, async () => {
          console.log("No mine!!");

          const { id, index, task } = input;
          const itemXmlFile = await getDmdItemXML(ctx, task, index);

          const file = itemXmlFile.toString("base64");

          await ctx.couch.wipmeta.uploadBase64Attachment({
            document: id,
            attachmentName: "dmd.xml",
            attachment: file,
            contentType: "application/octet-stream",
          });

          const dmdTask = await lookupDmdTaskForStorage(ctx, task);
          const { label } = await getDmdTaskItemByIndex(dmdTask, index);
          if (typeof label === "string") {
            await ctx.couch.wipmeta.updateLabel({
              id,
              label,
            });
          }
        });
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  });
