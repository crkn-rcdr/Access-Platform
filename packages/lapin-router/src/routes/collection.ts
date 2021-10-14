import { z } from "zod";
import {
  Collection,
  EditableCollection,
  NewCollection,
  Noid,
  ObjectListHandler,
  User,
  Slug,
  ObjectListPage,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC, HTTPErrorLike } from "../router.js";
import { TRPCError } from "@trpc/server";

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
  data: EditableCollection,
});

const NewInput = z.object({
  user: User,
  data: NewCollection,
});
const checkAdditions = z.object({
  id: Noid,
  slugArray: z.array(Slug),
});
export const collectionRouter = createRouter()
  .query("pageAfter", {
    input: PageAfterInput.parse,
    async resolve({
      input: { id, after, limit },
      ctx,
    }): Promise<ObjectListPage> {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const collectionCheck = Collection.safeParse(response.doc);
        if (collectionCheck.success) {
          const members = new ObjectListHandler(collectionCheck.data.members);
          return members.pageAfter(after, limit);
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
        const collectionCheck = Collection.safeParse(response.doc);
        if (collectionCheck.success) {
          const members = new ObjectListHandler(collectionCheck.data.members);
          return members.pageBefore(before, limit);
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
  .mutation("edit", {
    input: EditInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.editCollection(input);
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  })
  .mutation("new", {
    input: NewInput.parse,
    async resolve({ input, ctx }) {
      try {
        const id: Noid = await ctx.noid.mintOne();
        await ctx.couch.access.createCollection({
          id,
          ...input,
        });
        return id;
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  })
  .query("checkAdditions", {
    input: checkAdditions.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.checkAdditions(input.id, input.slugArray);
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  });
