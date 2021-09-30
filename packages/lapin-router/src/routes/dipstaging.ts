import { z } from "zod";

import { createRouter, httpErrorToTRPC, HTTPErrorLike } from "../router.js";
import { Slug, User } from "@crkn-rcdr/access-data";

const ListFromDates = z.object({
  from: z.string(),
  to: z.string(),
});

const SmeltInput = z.object({
  user: User,
  id: z.string(),
  slug: Slug,
});

const ViewInput = z.object({
  page: z.number(),
  pageSize: z.number(),
  to: z.string().optional(),
  from: z.string().optional(),
});

export const dipstagingRouter = createRouter()
  .query("listFromKeys", {
    input: z.array(Slug).parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromKeys(input, ctx.couch.access);
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  })
  .query("listFromDates", {
    input: ListFromDates.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromDates(
          input.from,
          input.to,
          ctx.couch.access
        );
      } catch (e) {
        throw httpErrorToTRPC(e as HTTPErrorLike);
      }
    },
  })
  .query("listNewDip", {
    input: ViewInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromView(
          "newDip",
          input.pageSize,
          (input.page - 1) * input.pageSize,
          input.from,
          input.to
        );
      } catch (e) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("listSmeltQueue", {
    input: ViewInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromView(
          "smeltQueue",
          input.pageSize,
          (input.page - 1) * input.pageSize,
          input.from,
          input.to
        );
      } catch (e) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("listSmeltStatus", {
    input: ViewInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromView(
          "smeltStatus",
          input.pageSize,
          (input.page - 1) * input.pageSize,
          input.from,
          input.to
        );
      } catch (e) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("listNeverSmelted", {
    input: ViewInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromView(
          "neverSmelted",
          input.pageSize,
          (input.page - 1) * input.pageSize,
          input.from,
          input.to
        );
      } catch (e) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("requestSmelt", {
    input: SmeltInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.update({
          ddoc: "access",
          name: "requestSmelt",
          docId: input.id,
          body: input,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
