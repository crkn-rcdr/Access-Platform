import { z } from "zod";
import { DMDFORMATS, User, Slug } from "@crkn-rcdr/access-data";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { isSucceededDMDTask } from "@crkn-rcdr/access-data";
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
  user: User,
});

const StorePreservationInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(),
  slug: z.string(),
  user: User,
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
        return await ctx.couch.dmdtask.getAttachmentAsJSON({
          document: input.task,
          attachment: `${input.index}.${input.type}`,
        });
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
        console.log(ctx.swift.accessFiles, input);
        /* 
          - Looks up the task
        */
        const dmdTaskLookup = await ctx.couch.dmdtask.getSafe(input.task);

        if (dmdTaskLookup.found) {
          const dmdTask = dmdTaskLookup.doc;

          if (isSucceededDMDTask(dmdTask)) {
            /* 
              - Get the attachment [index].xml from the dmdtask document (using the dmdtask handler's getAttachment method) and;
            */
            const itemXMLFile = await ctx.couch.dmdtask.getAttachment({
              document: input.task,
              attachment: `${input.index}.xml`,
            });

            const item = dmdTask?.items?.[input.index];

            if (item) {
              /* 
                - Get the [noid] and [type] of the access object using the [slug] paramter.
              */
              const accessObjectLookup = await ctx.couch.access.findUnique(
                "slug",
                input.slug,
                ["id", "type"] as const
              );

              if (accessObjectLookup.found) {
                const accesObject = accessObjectLookup.result;
                /* 
                - Successfully parsed items will have a field called item[output] which can have the values marc, dc, or issueinfo. Determine the correct filename of the attachment using [output] and [noid]. The relevant possible filenames here are dmdMARC.xml, dmdDC.xml, and dmdISSUEINFO.xml. (ex: 69429/[noid]/dmdMARC.xml)
                */
                const itemXMLFileName =
                  accesObject.id +
                  (item.output === "marc"
                    ? "/dmdMARC.xml"
                    : item.output === "dc"
                    ? "/dmdDC.xml"
                    : item.output === "issueinfo"
                    ? "/dmdISSUEINFO.xml"
                    : ""); // TODO: clean

                /* 
                - Then, use swift.accessMetadata.putObject to send it to Swift with the object name and content-type .
                */
                console.log(
                  { data: itemXMLFile, contentType: "application/xml" },
                  itemXMLFileName
                );

                const storeResult = await ctx.swift.accessMetadata.putObject(
                  itemXMLFileName,
                  { data: itemXMLFile, contentType: "application/xml" }
                );

                if (storeResult.code === 201) {
                  /* 
                  - Then, update the access objects label to the label corresponding to item[index]. Use access.editCollection or access.editManifest depending on [type] to update the object with the following:
                  { "label": { "none": items[index][labe] } }
                  */
                  /* 
                    - Get the [label] corresponding to item[index],
                  */
                  if (item.label) {
                    const itemLabel: Record<string, string> = {
                      none: item.label,
                    };

                    const labelUpdateObject = {
                      id: accesObject.id,
                      user: input.user,
                      data: {
                        label: itemLabel,
                      },
                    };

                    const labelUpdateResult =
                      accesObject.type === "manifest"
                        ? await ctx.couch.access.editManifest(labelUpdateObject)
                        : await ctx.couch.access.editCollection(
                            labelUpdateObject
                          );

                    if (labelUpdateResult.label["none"] === itemLabel["none"]) {
                      return true;
                    } else throw "Label not updated successfully.";
                  }
                } else throw "Problem storing XML file";
              } else throw "Could not find object in access";
            } else throw "Could not retrieve item from dmd task.";
          } else throw "Dmd task has not completed successfully yet.";
        } else throw "Could not find dmd task";
        return false;
      } catch (e) {
        console.log("DMD Task error:", e);
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
