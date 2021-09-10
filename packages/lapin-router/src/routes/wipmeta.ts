import { z } from "zod";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { TRPCError } from "@trpc/server";
import {
  getDmdItemXML,
  getDmdTaskItemByIndex,
  lookupDmdTaskForStorage,
} from "../util/dmdTask.js";

export const StorePreservationInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(),
  //slug: Slug,
  slug: z.string(), // = prefix.slug
});

export const wipmetaRouter = createRouter()
  .query("get", {
    input: z.string(), //Slug.parse,
    async resolve({ input: id, ctx }) {
      const response = await ctx.couch.wipmeta.getSafe(id);
      if (response.found) return response.doc;
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
    },
  })
  .mutation("storePreservation", {
    input: StorePreservationInput.parse,
    async resolve({ input, ctx }) {
      try {
        const itemXmlFile = await getDmdItemXML(ctx, input.task, input.index);

        const file = itemXmlFile.toString("base64");

        const response = await ctx.couch.wipmeta.uploadBase64Attachment({
          document: input.slug,
          attachmentName: "dmd.xml",
          attachment: file,
          contentType: "application/octet-stream",
        });

        const dmdTask = await lookupDmdTaskForStorage(ctx, input.task);
        const { label } = await getDmdTaskItemByIndex(dmdTask, input.index);
        if (typeof label === "string") {
          await ctx.couch.wipmeta.updateLabel({
            id: input.slug,
            label,
          });
        }

        return response;
      } catch (e) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  });
