import { z } from "zod";
import { Noid, Slug } from "@crkn-rcdr/access-data";
import { createRouter } from "../router.js";

import type { UniqueResult } from "@crkn-rcdr/couch-utils";

type SlugCouchResult = {
  _id: Noid;
  slug: Slug;
};

type SlugResult = {
  id: Noid;
  slug: Slug;
};

const SlugArray = z.array(Slug);

const toResult = (
  response: UniqueResult<SlugCouchResult, "slug">
): UniqueResult<SlugResult, "slug"> => {
  return {
    found: response.found,
    result: {
      slug: response.result.slug,
      id: response.found ? response.result._id : undefined,
    },
  } as UniqueResult<SlugResult, "slug">;
};

export const slugRouter = createRouter()
  .query("search", {
    input: Slug.parse,
    async resolve({ input: q, ctx }): Promise<{ id: Noid; slug: Slug }[]> {
      const response = await ctx.couch.access.findWithPrefix<
        SlugCouchResult,
        "slug"
      >({
        testField: "slug",
        testValue: q,
        resultFields: ["_id", "slug"],
      });
      return response.map((record) => {
        return { id: record._id, slug: record.slug };
      });
    },
  })
  .query("resolve", {
    input: Slug.parse,
    async resolve({ input: q, ctx }) {
      const response = await ctx.couch.access.findUnique<
        SlugCouchResult,
        "slug"
      >({
        testField: "slug",
        testValue: q,
        resultFields: ["_id", "slug"],
      });

      return toResult(response);
    },
  })
  .query("resolveMany", {
    input: SlugArray.parse,
    async resolve({ input: q, ctx }) {
      const responses = await ctx.couch.access.findUniqueArray<
        SlugCouchResult,
        "slug"
      >({
        testField: "slug",
        testValues: q,
        resultFields: ["_id", "slug"],
      });

      return responses.map((response) => toResult(response));
    },
  });
