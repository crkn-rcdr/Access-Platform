import { z } from "zod";
import {
  EditableCollection,
  NewCollection,
  Noid,
  User,
  Slug,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";

const EditInput = z.object({
  id: Noid,
  user: User,
  data: EditableCollection,
});

const NewInput = z.object({
  user: User,
  data: NewCollection,
});
//const SlugArray = z.array(Slug);
const checkAdditions = z.object({
  slug: z.array(Slug),
});
export const collectionRouter = createRouter()
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
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("checkAdditions", {
    input: checkAdditions.parse,
    async resolve({ input, ctx }): Promise<void> {
      try {
        const resolutions = ctx.couch.access.checkAdditions(input);
        console.log("resolution", resolutions);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
