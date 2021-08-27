import { z } from "zod";
import {
  EditableManifest,
  NewManifest,
  Noid,
  User,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";

const EditInput = z.object({
  id: Noid,
  user: User,
  data: EditableManifest,
});

const NewInput = z.object({
  user: User,
  data: NewManifest,
});

export const manifestRouter = createRouter()
  .mutation("edit", {
    input: EditInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.editManifest(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("create", {
    input: NewInput.parse,
    async resolve({ input, ctx }) {
      try {
        const id: Noid = await ctx.noid.mintOne();
        return await ctx.couch.access.createManifest({
          id,
          ...input,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
