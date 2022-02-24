import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { Noid, User, Slug } from "@crkn-rcdr/access-data";

const CreateInput = z.object({
  name: Slug,
  manifests: z.array(Noid),
  user: User,
});

const RequestInput = z.object({
  user: User,
  id: z.string(),
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
        return await ctx.couch.ocr.find(q, null, { limit: 200 });
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
        const { name, manifests, user } = input;
        let canvases: Noid[] = [];
        for (const id of manifests) {
          const manifest = await ctx.couch.access.get(id);
          if (manifest && manifest.type === "manifest") {
            for (const canvas of manifest.canvases) {
              if (!canvas.id) continue;
              if (!canvases.includes(canvas.id)) {
                canvases.push(canvas.id);
              }
            }
          }
        }
        return await ctx.couch.ocr.create({ name, user, canvases });
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("requestExport", {
    input: RequestInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.ocr.requestExport(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("requestImport", {
    input: RequestInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.ocr.requestImport(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("cancelExport", {
    input: RequestInput,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.ocr.cancelExport(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("cancelImport", {
    input: RequestInput,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.ocr.cancelImport(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("delete", {
    input: z.string(),
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.ocr.delete({ document: input });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
