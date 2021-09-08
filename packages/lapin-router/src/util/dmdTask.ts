import { z } from "zod";
import {
  DMDFORMATS,
  User,
  Slug,
  SucceededDMDTask,
  Noid,
} from "@crkn-rcdr/access-data";
import { isSucceededDMDTask } from "@crkn-rcdr/access-data";
import { LapinContext } from "../context.js";

export const NewInput = z.object({
  user: User,
  format: z.enum(DMDFORMATS),
  file: z.string(), // any othervalidation needed?
  fileName: z.string(), // any othervalidation needed?
});

export const FetchInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(), // array index of the item you want to fetch
  type: z.enum(["xml", "json"]), // type of attachment to return
});

export const StoreAccessInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(), // array index of item whose metadata is being stored
  slug: Slug, // prefix + id (we might not need this if we send the resolved noid)
  noid: z.string(), // result of slug lookup
  user: User,
});

// Not sure if I should move these somewhere else
export const lookupDmdTaskForStorage = async function (
  ctx: LapinContext,
  dmdTaskId: string
) {
  const dmdTaskLookup = await ctx.couch.dmdtask.getSafe(dmdTaskId);

  if (dmdTaskLookup.found) {
    if (isSucceededDMDTask(dmdTaskLookup.doc)) {
      return dmdTaskLookup.doc;
    } else throw "Dmd task has not completed successfully yet.";
  } else throw "Could not find dmd task";
};

export const getDmdItemXML = async function (
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
};

export const getDmdTaskItemByIndex = async function (
  dmdTask: SucceededDMDTask,
  index: number
) {
  const item = dmdTask?.items?.[index];
  if (item) return item;
  else throw "Could not retrieve item from dmd task.";
};

export const getAccessObjectForDmdTaskItem = async function (
  ctx: LapinContext,
  slug: Slug
) {
  const accessObjectLookup = await ctx.couch.access.findUnique("slug", slug, [
    "id",
    "type",
  ] as const);

  if (accessObjectLookup.found) return accessObjectLookup.result;
  else throw "Could not find access object for dmd task item.";
};

export const getWipmetaObjectForDmdTaskItem = async function (
  ctx: LapinContext,
  id: string
) {
  const wipmetaObjectLookup = await ctx.couch.wipmeta.getSafe(id);
  if (wipmetaObjectLookup.found) return wipmetaObjectLookup.doc;
  else throw "Could not find wipmeta (preservation) object for dmd task item.";
};

export const getDmdTaskItemXMLFileName = function (
  noid: Noid,
  output: "dc" | "marc" | "issueinfo" | undefined
) {
  if (output === "marc") return noid + "/dmdMARC.xml";
  else if (output === "dc") return noid + "/dmdDC.xml";
  else if (output === "issueinfo") return noid + "/dmdISSUEINFO.xml";
  else throw "Could not assemble metadata XML file name for dmd task item.";
};

export const storeDmdTaskItemXmlFile = async function (
  ctx: LapinContext,
  itemXMLFileName: string,
  itemXmlFile: Buffer
) {
  const storeResult = await ctx.swift.accessMetadata.putObject(
    itemXMLFileName,
    { data: itemXmlFile, contentType: "application/xml" }
  );

  if (storeResult.code === 201) return true;
  else throw "Could not store dmd task item xml file in swift.";
};

export const updateLabelForDmdTaskItemAccessObject = async function (
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
};
