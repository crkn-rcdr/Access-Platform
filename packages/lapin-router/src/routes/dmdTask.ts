import { z } from "zod";
import {
  DMDFORMATS,
  User,
  Slug,
  SucceededDMDTask,
  Noid,
} from "@crkn-rcdr/access-data";
import { TRPCError } from "@trpc/server";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { isSucceededDMDTask } from "@crkn-rcdr/access-data";
import { LapinContext } from "../context.js";
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
  slug: Slug, // prefix + id (we might not need this if we send the resolved noid)
  noid: z.string(), // result of slug lookup
  user: User,
});

const StorePreservationInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(),
  slug: Slug,
  user: User,
});

// Not sure if I should move these somewhere else
async function lookupDmdTaskForStorage(ctx: LapinContext, dmdTaskId: string) {
  const dmdTaskLookup = await ctx.couch.dmdtask.getSafe(dmdTaskId);

  if (dmdTaskLookup.found) {
    if (isSucceededDMDTask(dmdTaskLookup.doc)) {
      return dmdTaskLookup.doc;
    } else throw "Dmd task has not completed successfully yet.";
  } else throw "Could not find dmd task";
}

async function getDmdItemXML(
  ctx: LapinContext,
  dmdTaskId: string,
  index: number
) {
  const itemXmlFile = await ctx.couch.dmdtask.getAttachment({
    document: dmdTaskId,
    attachment: `${index}.xml`,
  });

  if (itemXmlFile) return itemXmlFile;
  else throw "Could not retreive XML attachment for item from dmd task.";
}

async function getDmdTaskItemByIndex(dmdTask: SucceededDMDTask, index: number) {
  const item = dmdTask?.items?.[index];
  if (item) return item;
  else throw "Could not retrieve item from dmd task.";
}

async function getAccessObjectForDmdTaskItem(ctx: LapinContext, slug: Slug) {
  const accessObjectLookup = await ctx.couch.access.findUnique("slug", slug, [
    "id",
    "type",
  ] as const);

  if (accessObjectLookup.found) return accessObjectLookup.result;
  else throw "Could not find access object for dmd task item.";
}

function getDmdTaskItemXMLFileName(
  noid: Noid,
  output: "dc" | "marc" | "issueinfo" | undefined
) {
  if (output === "marc") return noid + "/dmdMARC.xml";
  else if (output === "dc") return noid + "/dmdDC.xml";
  else if (output === "issueinfo") return noid + "/dmdISSUEINFO.xml";
  else throw "Could not assemble metdata XML file name for dmd task item.";
}

async function storeDmdTaskItemXmlFile(
  ctx: LapinContext,
  itemXMLFileName: string,
  itemXmlFile: Buffer
) {
  const storeResult = await ctx.swift.accessMetadata.putObject(
    itemXMLFileName,
    { data: itemXmlFile, contentType: "application/xml" }
  );

  if (storeResult.code === 201) return true;
  else throw "Could notstore dmd task item xml file in swift.";
}

async function updateLabelForDmdTaskItemAccessObject(
  ctx: LapinContext,
  label: string,
  noid: Noid,
  user: User,
  type: "alias" | "manifest" | "collection"
) {
  const itemLabel: Record<string, string> = {
    none: label,
  };

  const labelUpdateObject = {
    id: noid,
    user: user,
    data: {
      label: itemLabel,
    },
  };

  const labelUpdateResult =
    type === "manifest"
      ? await ctx.couch.access.editManifest(labelUpdateObject)
      : await ctx.couch.access.editCollection(labelUpdateObject);

  if (labelUpdateResult.label["none"] === itemLabel["none"]) {
    return true;
  } else throw "Label not updated successfully.";
}

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
        // Each of these methods throws an error if the results arent what is expected.
        const dmdTask = await lookupDmdTaskForStorage(ctx, input.task);

        const itemXmlFile = await getDmdItemXML(ctx, input.task, input.index);

        const item = await getDmdTaskItemByIndex(dmdTask, input.index);

        const accessObject = await getAccessObjectForDmdTaskItem(
          ctx,
          input.slug
        );

        const itemXMLFileName = getDmdTaskItemXMLFileName(
          accessObject.id,
          item.output
        );

        await storeDmdTaskItemXmlFile(ctx, itemXMLFileName, itemXmlFile);

        // Should I add a length check?
        if (typeof item.label === "string") {
          await updateLabelForDmdTaskItemAccessObject(
            ctx,
            item.label,
            accessObject.id,
            input.user,
            accessObject.type
          );
        }
      } catch (e) {
        console.log(e?.message);
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
