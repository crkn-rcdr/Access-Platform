import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { Noid, User } from "@crkn-rcdr/access-data";

const CreateInput = z.object({
  user: User,
  canvases: z.array(Noid),
});

export const ocrRouter = createRouter()
  .query("get", {
    input: z.string(),
    async resolve({ input: id, ctx }) {
      const response = await ctx.couch.ocr.getSafe(id);
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
        return await ctx.couch.ocr.find(q);
      } catch (e: any) {
        console.log("err", e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("create", {
    input: CreateInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.ocr.create(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
