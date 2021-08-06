import { z } from "zod";
import { EditableManifest, Noid, User } from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";

const EditInput = z.object({
  id: Noid,
  user: User,
  data: EditableManifest,
});

export const manifestRouter = createRouter().mutation("edit", {
  input: EditInput.parse,
  async resolve({ input, ctx }) {
    try {
      return await ctx.couch.access.editManifest(input);
    } catch (e) {
      throw httpErrorToTRPC(e);
    }
  },
});
