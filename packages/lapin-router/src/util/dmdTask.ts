/**
 * @module dmdTasksStore
 * @description
 * This file contains utility methods that keeps the dmdTask router more readable. The store in access request has many steps which are isolated into separate methods below.
 */

import { z } from "zod";
import {
  DMDFORMATS,
  User,
  Slug,
  SucceededDMDTask,
  Noid,
  isSucceededDMDTask,
  AccessObjectType,
} from "@crkn-rcdr/access-data";
import { LapinContext } from "../context.js";
import { TRPCError } from "@trpc/server";

export const NewInput = z.object({
  user: User,
  format: z.enum(DMDFORMATS),
  file: z.string(), // any othervalidation needed?
  fileName: z.string(), // any othervalidation needed?
});

export type NewInput = z.infer<typeof NewInput>;

export const FetchInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(), // array index of the item you want to fetch
  type: z.enum(["xml", "json"]), // type of attachment to return
});

export const StoreAccessInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(), // array index of item whose metadata is being stored
  slug: Slug, // prefix + id (we might not need this if we send the resolved noid)
  user: User,
});

export const findObjectInPreservation = async function (
  ctx: LapinContext,
  slug: Slug
) {
  try {
    const response = await ctx.couch.wipmeta.list({
      key: slug,
      limit: 1,
    });
    if (response.rows.length === 1) return response.rows[0]?.doc;
    else return null;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return null;
  }
};

// Not sure if I should move these somewhere else
export const lookupDmdTaskForStorage = async function (
  ctx: LapinContext,
  dmdTaskId: string
) {
  try {
    const dmdTaskLookup = await ctx.couch.dmdtask.getSafe(dmdTaskId);

    if (dmdTaskLookup.found) {
      return dmdTaskLookup.doc;
    } else return null;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return null;
  }
};

export const getDmdItemXML = async function (
  ctx: LapinContext,
  dmdTaskId: string,
  index: number
) {
  try {
    const itemXmlFile = await ctx.couch.dmdtask.getAttachment({
      document: dmdTaskId,
      attachment: `${index}.xml`,
    });

    if (itemXmlFile) return itemXmlFile;
    else return null;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return null;
  }
};

export const getDmdTaskItemByIndex = async function (
  dmdTask: SucceededDMDTask,
  index: number
) {
  const item = dmdTask?.items?.[index];
  if (item) return item;
  else return null;
};

export const getAccessObjectForDmdTaskItem = async function (
  ctx: LapinContext,
  slug: Slug
) {
  try {
    const accessObjectLookup = await ctx.couch.access.findUnique("slug", slug, [
      "id",
      "type",
      "dmdType",
    ] as const);

    if (accessObjectLookup.found) return accessObjectLookup.result;
    else return null;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return null;
  }
};

export const getWipmetaObjectForDmdTaskItem = async function (
  ctx: LapinContext,
  id: string
) {
  try {
    const wipmetaObjectLookup = await ctx.couch.wipmeta.getSafe(id);
    if (wipmetaObjectLookup.found) return wipmetaObjectLookup.doc;
    else return null;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return null;
  }
};

export const getItemMetadataXMLFileName = function (
  noid: Noid,
  output: "dc" | "marc" | "issueinfo" | undefined
) {
  if (output === "marc") return noid + "/dmdMARC.xml";
  else if (output === "dc") return noid + "/dmdDC.xml";
  else if (output === "issueinfo") return noid + "/dmdISSUEINFO.xml";
  else return null;
};

export const storeDmdTaskItemXmlFile = async function (
  ctx: LapinContext,
  itemXMLFileName: string,
  itemXmlFile: Buffer
) {
  try {
    const storeResult = await ctx.swift.accessMetadata.putObject(
      itemXMLFileName,
      { data: itemXmlFile, contentType: "application/xml" }
    );

    if (storeResult.code === 201) return true;
    else return false;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return false;
  }
};

export const updateLabelForDmdTaskItemAccessObject = async function (
  ctx: LapinContext,
  label: string,
  noid: Noid,
  user: User,
  type: AccessObjectType
) {
  try {
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
    } else return false;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return false;
  }
};

export const uploadDmdTaskItemXmlFile = async function (
  ctx: LapinContext,
  id: string,
  file: string
) {
  try {
    await ctx.couch.wipmeta.uploadBase64Attachment({
      document: id,
      attachmentName: "dmd.xml",
      attachment: file,
      contentType: "application/octet-stream",
    });
    return true;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return false;
  }
};

export const updateLabelForDmdTaskItemWipmetaObject = async function (
  ctx: LapinContext,
  id: string,
  label: string
) {
  try {
    const labelRes = await ctx.couch.wipmeta.updateLabel({
      id,
      label,
    });
    if (labelRes) {
      return true;
    } else return false;
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return false;
  }
};

export const storePreservation = async function (
  ctx: LapinContext,
  id: string,
  task: string,
  index: number
) {
  await ctx.routeLimiter.getLimiterSemaphore("storePreservation")?.wait();

  const wipmetaObj = await findObjectInPreservation(ctx, id);

  if (wipmetaObj === null) {
    await ctx.routeLimiter.getLimiterSemaphore("storePreservation")?.signal();
    throw new TRPCError({
      code: "PATH_NOT_FOUND",
      message: "Item not found in preservation. Id: " + id,
    });
  } else {
    const itemXmlFile = await getDmdItemXML(ctx, task, index);
    if (itemXmlFile === null) {
      await ctx.routeLimiter.getLimiterSemaphore("storePreservation")?.signal();
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message:
          "Could not get Metadata XML file for item with id: " +
          id +
          " from DMD task with id: " +
          task,
      });
    } else {
      const dmdTask = await lookupDmdTaskForStorage(ctx, task);
      if (dmdTask === null) {
        await ctx.routeLimiter
          .getLimiterSemaphore("storePreservation")
          ?.signal();
        throw new TRPCError({
          code: "PATH_NOT_FOUND",
          message: "Could not get DMD task with id: " + task,
        });
      } else if (!isSucceededDMDTask(dmdTask)) {
        await ctx.routeLimiter
          .getLimiterSemaphore("storePreservation")
          ?.signal();
        throw new TRPCError({
          code: "METHOD_NOT_SUPPORTED",
          message: "DMD task has not completed successfully yet. Id: " + task,
        });
      } else {
        const item = await getDmdTaskItemByIndex(dmdTask, index);

        if (item === null) {
          await ctx.routeLimiter
            .getLimiterSemaphore("storePreservation")
            ?.signal();
          throw new TRPCError({
            code: "PATH_NOT_FOUND",
            message:
              "Could not get item at index: " +
              index +
              " from DMD task with id: " +
              task,
          });
        } else {
          const file = itemXmlFile.toString("base64");

          const uploadRes = await uploadDmdTaskItemXmlFile(ctx, id, file);

          if (!uploadRes) {
            await ctx.routeLimiter
              .getLimiterSemaphore("storePreservation")
              ?.signal();
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                "Could not store metadata XML file in preservation for item with id: " +
                id +
                " from DMD task with id: " +
                task,
            });
          } else {
            const label = item.label;
            if (label && typeof item.label === "string") {
              const labelRes = await updateLabelForDmdTaskItemWipmetaObject(
                ctx,
                id,
                label
              );
              if (!labelRes) {
                await ctx.routeLimiter
                  .getLimiterSemaphore("storePreservation")
                  ?.signal();
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message:
                    "Could not update label to " +
                    label +
                    " for item with id: " +
                    id +
                    " from DMD task with id: " +
                    task,
                });
              }
            }
          }
        }
      }
    }
  }
  await ctx.routeLimiter.getLimiterSemaphore("storePreservation")?.signal();
};

const deleteOldMetadataFileIfExists = async (
  ctx: LapinContext,
  accessObject: any
) => {
  //console.log(accessObject, "check", accessObject && "dmdType" in accessObject);
  if (accessObject && "dmdType" in accessObject) {
    const type = accessObject.dmdType;

    const existingFileName = getItemMetadataXMLFileName(accessObject?.id, type);

    //console.log("existingFileName", existingFileName);

    if (existingFileName) {
      let metadataFileExists = false;
      try {
        await ctx.swift.accessMetadata.getObject(existingFileName);
        metadataFileExists = true;
      } catch (e: any) {
        console.log("DMD error: ", e?.message);
        //console.log("No existing metadata file in swift");
      }

      if (metadataFileExists) {
        //console.log("Existing metadata file in swift, deleting...");
        try {
          await ctx.swift.accessMetadata.deleteObject(existingFileName);
          return true;
        } catch (e: any) {
          console.log("DMD error: ", e?.message);
          return false;
        }
      }
    }
  }
  return true;
};

const updateDMDTypeInAccess = async (
  ctx: LapinContext,
  id: string,
  accessObjectType: "collection" | "manifest" | "pdf",
  dmdType: "dc" | "marc" | "issueinfo" | undefined,
  user: User
) => {
  try {
    if (dmdType) {
      if (accessObjectType === "manifest") {
        await ctx.couch.access.editManifest({
          id,
          user,
          data: {
            dmdType,
          },
        });
      } else if (accessObjectType === "collection") {
        await ctx.couch.access.editCollection({
          id,
          user,
          data: {
            dmdType,
          },
        });
      }
    }
  } catch (e: any) {
    console.log("DMD error: ", e?.message);
    return false;
  }
  return true;
};

export const storeAccess = async function (
  ctx: LapinContext,
  user: User,
  task: string,
  index: number,
  slug: Slug
) {
  await ctx.routeLimiter.getLimiterSemaphore("storeAccess")?.wait();
  const accessObject = await getAccessObjectForDmdTaskItem(ctx, slug);

  if (accessObject === null) {
    await ctx.routeLimiter.getLimiterSemaphore("storeAccess")?.signal();
    throw new TRPCError({
      code: "PATH_NOT_FOUND",
      message: "Item not found in access. Id: " + slug,
    });
  } else {
    const dmdTask = await lookupDmdTaskForStorage(ctx, task);
    if (dmdTask === null) {
      await ctx.routeLimiter.getLimiterSemaphore("storeAccess")?.signal();
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: "Could not get DMD task with id: " + task,
      });
    } else if (!isSucceededDMDTask(dmdTask)) {
      await ctx.routeLimiter.getLimiterSemaphore("storeAccess")?.signal();
      throw new TRPCError({
        code: "METHOD_NOT_SUPPORTED",
        message: "DMD task has not completed successfully yet. Id: " + task,
      });
    } else {
      const itemXmlFile = await getDmdItemXML(ctx, task, index);
      if (itemXmlFile === null) {
        await ctx.routeLimiter.getLimiterSemaphore("storeAccess")?.signal();
        throw new TRPCError({
          code: "PATH_NOT_FOUND",
          message:
            "Could not get Metadata XML file for item with id: " +
            slug +
            " from DMD task with id: " +
            task,
        });
      } else {
        const item = await getDmdTaskItemByIndex(dmdTask, index);
        if (item === null) {
          await ctx.routeLimiter.getLimiterSemaphore("storeAccess")?.signal();
          throw new TRPCError({
            code: "PATH_NOT_FOUND",
            message:
              "Could not get item at index: " +
              index +
              " from DMD task with id: " +
              task,
          });
        } else {
          const itemXMLFileName = getItemMetadataXMLFileName(
            accessObject?.id,
            item.output
          );

          if (itemXMLFileName === null) {
            await ctx.routeLimiter.getLimiterSemaphore("storeAccess")?.signal();
            throw new TRPCError({
              code: "PATH_NOT_FOUND",
              message:
                "Could not compile metadata file name for item with id: " +
                accessObject?.id +
                " from DMD task with id: " +
                task,
            });
          } else {
            // take current dmdTask type for item then compile old file name and delete it
            const deleteRes = await deleteOldMetadataFileIfExists(
              ctx,
              accessObject
            );
            console.log("deleteRes", deleteRes);
            if (!deleteRes) {
              await ctx.routeLimiter
                .getLimiterSemaphore("storeAccess")
                ?.signal();
              throw new TRPCError({
                code: "PATH_NOT_FOUND",
                message:
                  "Could not delete old metadata file for item with id: " +
                  accessObject?.id +
                  " from DMD task with id: " +
                  task,
              });
            } else {
              const storeResult = await storeDmdTaskItemXmlFile(
                ctx,
                itemXMLFileName,
                itemXmlFile
              );

              if (!storeResult) {
                await ctx.routeLimiter
                  .getLimiterSemaphore("storeAccess")
                  ?.signal();
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message:
                    "Could not store metadata XML file in swift for item with id: " +
                    accessObject?.id +
                    " from DMD task with id: " +
                    task,
                });
              } else {
                //Change dmdType value for item
                const typeUpdated = await updateDMDTypeInAccess(
                  ctx,
                  accessObject.id,
                  accessObject.type,
                  item.output,
                  user
                );

                if (!typeUpdated) {
                  await ctx.routeLimiter
                    .getLimiterSemaphore("storeAccess")
                    ?.signal();
                  throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                      "Could not update dmdType for item with id: " +
                      accessObject?.id +
                      " from DMD task with id: " +
                      task,
                  });
                } else {
                  if (typeof item.label === "string") {
                    const labelRes =
                      await updateLabelForDmdTaskItemAccessObject(
                        ctx,
                        item.label,
                        accessObject?.id,
                        user,
                        accessObject?.type
                      );

                    if (!labelRes) {
                      await ctx.routeLimiter
                        .getLimiterSemaphore("storeAccess")
                        ?.signal();
                      throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message:
                          "Could not update label to " +
                          item.label +
                          " for item with id: " +
                          accessObject?.id +
                          " from DMD task with id: " +
                          task,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  await ctx.routeLimiter.getLimiterSemaphore("storeAccess")?.signal();
};
