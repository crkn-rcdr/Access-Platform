import { z } from "zod";
import { createRouter, HTTPErrorLike, httpErrorToTRPC } from "../router.js";
import {
  getDmdItemXML,
  getDmdTaskItemByIndex,
  lookupDmdTaskForStorage,
} from "../util/dmdTask.js";
import Timeout from "await-timeout";
import { Lock } from "semaphore-async-await";

const wipmetaStorageLimiter = new Lock();
const SWIFT_DELAY_MS = 5000;

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
        await wipmetaStorageLimiter.wait();

        const { id, index, task } = input;
        const itemXmlFile = await getDmdItemXML(ctx, task, index);

        const file = itemXmlFile.toString("base64");

        const response = await ctx.couch.wipmeta.uploadBase64Attachment({
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

        await Timeout.set(SWIFT_DELAY_MS);
        wipmetaStorageLimiter.signal();
        return response;
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  });
