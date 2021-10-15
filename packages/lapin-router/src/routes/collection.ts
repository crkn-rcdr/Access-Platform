import { z } from "zod";
import {
  EditableCollection,
  NewCollection,
  Noid,
  User,
  Slug,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC, HTTPErrorLike } from "../router.js";

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

const id = z.array(Noid);
export const collectionRouter = createRouter()
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
  })
  .query("viewMembersContext", {
    input: id.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.findUniqueArray("id", input, [
          "slug",
          "label",
        ] as const);
      } catch (e) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  });
