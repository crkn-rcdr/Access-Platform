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
import { createRouter, httpErrorToTRPC } from "../router.js";
import { TRPCError } from "@trpc/server";
import { LapinContext } from "../context.js";

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

const expandList = async (ctx: LapinContext, page: ObjectListPage) => {
  const expandedList = [];
  for (const obj of page.list) {
    const stuff = await ctx.couch.access.findUnique("id", obj.id, [
      "slug",
      "label",
      "type",
      "behavior",
    ] as const);
    if (stuff.found) {
      expandedList.push({
        labelFromMember: stuff.result.label,
        ...stuff.result,
        ...obj,
      });
    }
  }
  return { first: page.first, last: page.last, list: expandedList };
};

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
    async resolve({ input: { id, after, limit }, ctx }) {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const collectionCheck = Collection.safeParse(response.doc);
        if (collectionCheck.success) {
          const members = new ObjectListHandler(collectionCheck.data.members);
          const page = members.pageAfter(after, limit);
          return await expandList(ctx, page);
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
    async resolve({ input: { id, before, limit }, ctx }) {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const collectionCheck = Collection.safeParse(response.doc);
        if (collectionCheck.success) {
          const members = new ObjectListHandler(collectionCheck.data.members);
          const page = members.pageBefore(before, limit);
          return await expandList(ctx, page);
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
        throw httpErrorToTRPC(e);
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
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("checkAdditions", {
    input: checkAdditions.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.checkAdditions(input.id, input.slugArray);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("removeMember", {
    input: z.object({
      id: Noid,
      member: Noid,
      user: User.optional(),
    }),
    async resolve({ input, ctx }) {
      try {
        await ctx.couch.access.removeMember(input);
        await ctx.couch.access.forceUpdate(input.member);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
