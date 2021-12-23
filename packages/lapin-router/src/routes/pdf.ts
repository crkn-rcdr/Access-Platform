import { z } from "zod";
import { EditablePdf, Noid, User } from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";

const EditInput = z.object({
  id: Noid,
  user: User,
  data: EditablePdf,
});

export const pdfRouter = createRouter().mutation("edit", {
  input: EditInput.parse,
  async resolve({ input, ctx }) {
    try {
      return await ctx.couch.access.editPdf(input);
    } catch (e) {
      throw httpErrorToTRPC(e);
    }
  },
});
