import { z } from "zod";
import { DMDFORMATS, User, Slug } from "@crkn-rcdr/access-data";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";

const NewInput = z.object({
  user: User,
  format: z.enum(DMDFORMATS),
  file: z.string(), // any othervalidation needed?
});

const FetchInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(), // array index of the item you want to fetch
  type: z.enum(["xml", "json"]), // type of attachment to return
});

const StoreAccessInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(), // array index of item whose metadata is being stored
  slug: z.string(), // prefix + id (we might not need this if we send the resolved noid)
  noid: z.string(), // result of slug lookup
});

const StorePreservationInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(),
  slug: z.string(),
});

export const dmdTaskRouter = createRouter()
  .query("get", {
    input: Slug.parse,
    async resolve({ input: id, ctx }) {
      const response = await ctx.couch.dmdtask.getSafe(id);
      if (response.found) return response.doc;
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No dmd task with id ${id} found.`,
      });
    },
  })
  .mutation("fetchResult", {
    input: FetchInput.parse,
    async resolve({ input, ctx }) {
      /*
       Fetches the attachment in the dmdtask document 
       and returns its contents. 
       Results should be decoded in the browser.
      */
      try {
        const response = await ctx.couch.dmdtask.getAttachment({
          document: input.task,
          attachment: `${input.index}.${input.type}`,
        });
        return response;
      } catch (e) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("create", {
    input: NewInput.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.dmdtask.create(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("storeAccess", {
    input: StoreAccessInput.parse,
    async resolve({ input, ctx }) {
      try {
        /* 
        Yeah, the idea in lapin is that you'll be able to interact with objects in a particular container, but not do any of the scarier container management stuff.

        accessFiles: client.container("access-files"),
        accessMetadata: client.container("access-metadata"),
        The code above isn't in tests; it's in the context that lapin routers have access to.


        task: z.string(), // dmdtask uuid
        index: z.number(), // array index of item whose metadata is being stored
        slug: z.string(), // prefix + id (we might not need this if we send the resolved noid)
        noid: z.string(), // result of slug lookup

        Looks up the task's mdType & fetches the attachment and the label corresponding to index. 

        PUT
        /v1/{account}/{container}/{object}
        Create or replace object
        Determines the correct filename of the attachment using mdType and noid. 
        Stores the attachment in Swift. (Is this the right thing to call? ctx.swift.accessFiles.putObject("filename of the attachment using mdType and noid", attachment))

        Replaces the label of the object identified by noid.  (What should I update this to?)*/
        console.log(ctx.swift.accessFiles, input);

        return true; //await ctx.couch; Returns void, I think.
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("storePreservation", {
    input: StorePreservationInput.parse,
    async resolve() {
      //{ input, ctx }) {
      try {
        /* ask others what to do here */
        return true; //await ctx.couch;
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
