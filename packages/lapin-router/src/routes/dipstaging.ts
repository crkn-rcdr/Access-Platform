import { z } from "zod";

import { createRouter, httpErrorToTRPC } from "../router.js";
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

const CancelSmeltInput = z.object({
  user: User,
  id: z.string(),
});

const ViewInput = z.object({
  page: z.number(),
  pageSize: z.number(),
  to: z.string().optional(),
  from: z.string().optional(),
  status: z.boolean().optional(),
});

export const dipstagingRouter = createRouter()
  .query("listFromSlugs", {
    input: z.array(Slug).parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromSlugs(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("listFromKeys", {
    input: z.array(Slug).parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromKeys(input, ctx.couch.access);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("listFromDates", {
    input: ListFromDates.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.listFromDates(
          input.from,
          input.to
          //ctx.couch.access
        );
      } catch (e) {
        throw httpErrorToTRPC(e);
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
          input.to,
          input.status
        );
      } catch (e) {
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
  })
  .mutation("cancelSmelt", {
    input: CancelSmeltInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dipstaging.update({
          ddoc: "access",
          name: "cancelSmelt",
          docId: input.id,
          body: input.user,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
