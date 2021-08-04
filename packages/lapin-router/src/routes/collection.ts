import { z } from "zod";
import { EditableCollection, Noid, User } from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";

const EditInput = z.object({
  id: Noid,
  user: User,
  data: EditableCollection,
});

export const collectionRouter = createRouter().mutation("edit", {
  input: EditInput.parse,
  async resolve({ input, ctx }) {
    try {
      return await ctx.couch.access.editCollection(input);
    } catch (e) {
      throw httpErrorToTRPC(e);
    }
  },
});
