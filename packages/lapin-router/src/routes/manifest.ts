import { z } from "zod";
import {
  EditableManifest,
  Manifest,
  NewManifest,
  Noid,
  ObjectListHandler,
  ObjectListPage,
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

export const manifestRouter = createRouter()
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
        return await ctx.couch.access.editManifest(input);
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
  });
