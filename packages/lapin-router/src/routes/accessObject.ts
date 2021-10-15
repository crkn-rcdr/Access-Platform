import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  Noid,
  User,
  Manifest,
  Collection,
  PagedCollection,
  PagedManifest,
  toPagedManifest,
  toPagedCollection,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";

const NoidWithUser = z.object({
  id: Noid,
  user: User,
});

export const accessObjectRouter = createRouter()
  .query("get", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) return response.doc;
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
    },
  })
  .query("getPaged", {
    input: Noid.parse,
    async resolve({
      input: id,
      ctx,
    }): Promise<PagedCollection | PagedManifest> {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const manifestCheck = Manifest.safeParse(response.doc);
        if (manifestCheck.success) {
          return toPagedManifest(manifestCheck.data);
        }

        const collectionCheck = Collection.safeParse(response.doc);
        if (collectionCheck.success) {
          return toPagedCollection(collectionCheck.data);
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
  .mutation("publish", {
    input: NoidWithUser.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.publish(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("unpublish", {
    input: NoidWithUser.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.unpublish(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("unassignSlug", {
    input: NoidWithUser.parse,
    async resolve({ input, ctx }) {
      try {
        await ctx.couch.access.unassignSlug({
          id: input.id,
          user: input.user,
        });
        const response = await ctx.couch.access.getSafe(input.id);
        if (response.found) {
          if (response.doc.public) {
            await ctx.couch.access.unpublish({
              id: input.id,
              user: input.user,
            });
          }
        }
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
