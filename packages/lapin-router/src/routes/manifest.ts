import { z } from "zod";
import {
  EditableManifest,
  Manifest,
  NewManifest,
  Noid,
  ObjectListHandler,
  ObjectListPage,
  Slug,
  TextRecord,
  User,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { TRPCError } from "@trpc/server";

const PageInput = z.object({
  id: Noid,
  page: z.number().int().positive(),
  limit: z.number().int().positive().default(100),
});

const PageAfterInput = z.object({
  id: Noid,
  after: Noid.nullable(),
  limit: z.number().int().positive().default(100),
});

const PageBeforeInput = z.object({
  id: Noid,
  before: Noid.nullable(),
  limit: z.number().int().positive().default(100),
});

const EditInput = z.object({
  id: Noid,
  user: User,
  data: EditableManifest,
});

const NewInput = z.object({
  user: User,
  data: NewManifest,
});

const SearchInput = z.object({
  fields: z.array(z.string()),
  slugs: z.array(Slug),
});

export const manifestRouter = createRouter()
  .mutation("search", {
    input: SearchInput.parse,
    async resolve({ input, ctx }) {
      return (
        await ctx.couch.access.findUniqueArray("slug", input.slugs, [
          ...input.fields,
          "type",
        ])
      ).filter((result) => {
        if (result.length == 2 && result[1].found) {
          return result[1].result["type"] === "manifest";
        }
        return false;
      });
    },
  })
  .query("page", {
    input: PageInput.parse,
    async resolve({
      input: { id, page, limit },
      ctx,
    }): Promise<ObjectListPage> {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const manifestCheck = Manifest.safeParse(response.doc);
        if (manifestCheck.success) {
          const canvases = new ObjectListHandler(
            manifestCheck.data.canvases || []
          );
          return canvases.page(page, limit);
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
  .query("pageAfter", {
    input: PageAfterInput.parse,
    async resolve({
      input: { id, after, limit },
      ctx,
    }): Promise<ObjectListPage> {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const manifestCheck = Manifest.safeParse(response.doc);
        if (manifestCheck.success) {
          const canvases = new ObjectListHandler(
            manifestCheck.data.canvases || []
          );
          return canvases.pageAfter(after, limit);
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
  .query("pageBefore", {
    input: PageBeforeInput.parse,
    async resolve({
      input: { id, before, limit },
      ctx,
    }): Promise<ObjectListPage> {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const manifestCheck = Manifest.safeParse(response.doc);
        if (manifestCheck.success) {
          const canvases = new ObjectListHandler(
            manifestCheck.data.canvases || []
          );
          return canvases.pageBefore(before, limit);
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

  .query("getOCRStatus", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      try {
        return await ctx.couch.access.getOCRStatus(id);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("addCanvases", {
    input: z.object({
      id: Noid,
      canvases: z.array(Noid),
      user: User.optional(),
    }),
    async resolve({ input: { id, canvases, user }, ctx }) {
      try {
        // TODO: this assumes that each id in `canvases` is legit.
        // Should we check here?
        await ctx.couch.access.processList({
          id,
          command: ["add", canvases],
          user,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("removeCanvases", {
    input: z.object({
      id: Noid,
      canvases: z.array(Noid),
      user: User.optional(),
    }),
    async resolve({ input: { id, canvases, user }, ctx }) {
      try {
        await ctx.couch.access.processList({
          id,
          command: ["remove", canvases],
          user,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("moveCanvases", {
    input: z.object({
      id: Noid,
      canvases: z.array(Noid),
      toIndex: z.number().int(), // makes us unable to use index 0: .positive(),
      user: User.optional(),
    }),
    async resolve({ input: { id, canvases, toIndex, user }, ctx }) {
      try {
        await ctx.couch.access.processList({
          id,
          command: ["move", [canvases, toIndex]],
          user,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("relabelCanvas", {
    input: z.object({
      id: Noid,
      canvas: Noid,
      label: TextRecord,
      user: User.optional(),
    }),
    async resolve({ input: { id, canvas, label, user }, ctx }) {
      try {
        await ctx.couch.access.processList({
          id,
          command: ["relabel", [canvas, label]],
          user,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("edit", {
    input: EditInput.parse,
    async resolve({ input, ctx }) {
      try {
        const res = await ctx.couch.access.editManifest(input);

        const membership = await ctx.couch.access.getMembership(input.id);
        if (membership?.length) {
          const ids: any[] = membership
            .filter((collection) => typeof collection.id !== "undefined")
            .map((collection) => collection.id);

          // Don't hold up the response. This will run in the background without causing issues for end users. They don't need to be alerted about any of this in real time. The updateInternalmeta is displayed in the editor.
          ctx.couch.access.bulkForceUpdate(ids).catch((error) => {
            console.log(error);
          });
        }

        return res;
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("new", {
    input: NewInput.parse,
    async resolve({ input, ctx }) {
      try {
        const id: Noid = await ctx.noid.mintOne();
        await ctx.couch.access.createManifest({
          id,
          ...input,
        });
        return id;
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("singleCreateOCRPDF", {
    input: z.object({
      id: Noid,
      user: User,
    }),
    async resolve({ input: { id, user }, ctx }) {
      try {
        return await ctx.couch.access.createOCRPDF(id, user);
      } catch (e:any) {
        console.log(e?.message)
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("bulkCreateOCRPDF", {
    input: z.array(Noid),
    async resolve({ input, ctx }) {
      try {
        ctx.couch.access.bulkCreateOCRPDF(input).catch((error: any) => {
          console.log(error);
        });
        return {success: true};
      } catch (e:any) {
        console.log(e?.message)
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("ocrPDFQueue", {
    input: z.object({
      page: z.number(),
      pageSize: z.number(),
    }).parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.listFromView(
          "OCRPDFQueue",
          input.pageSize,
          (input.page - 1) * input.pageSize,
          null,
          null,
          null,
          "metadatabus"
        );
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("ocrPDFStatus", {
    input: z.object({
      page: z.number(),
      pageSize: z.number(),
    }).parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.listFromView(
          "OCRPDFStatus",
          input.pageSize,
          (input.page - 1) * input.pageSize,
          null,
          null,
          null,
          "metadatabus"
        );
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("cancelOCRPDFMany", {
    input: z.object({
      slugs: z.array(Slug),
      user: User,
    }).parse,
    async resolve({ input, ctx }) {
      try {
        let searchResults = await ctx.couch.access.findUniqueArray(
          "slug",
          input.slugs,
          ["id", "slug"] as const
        );
        for (let res of searchResults) {
          if (res.length === 2) {
            let data = res[1];
            if (data && "result" in data) {
              await ctx.couch.access.cancelOCRPDF({
                id: `${data["result"]["id"]}`,
                user: input.user,
              });
            }
          }
        }
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
