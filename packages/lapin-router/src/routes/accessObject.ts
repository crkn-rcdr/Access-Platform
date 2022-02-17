import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  Noid,
  User,
  PagedAccessObject,
  Pdf,
  toPagedManifest,
  toPagedCollection,
  AccessObject,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { getItemMetadataXMLFileName } from "../util/dmdTask.js";

const NoidWithUser = z.object({
  id: Noid,
  user: User,
});

export const accessObjectRouter = createRouter()
  .query("get", {
    input: Noid.parse,
    async resolve({ input: id, ctx }): Promise<AccessObject> {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) return response.doc;
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
    },
  })
  .query("getPaged", {
    input: Noid.parse,
    async resolve({ input: id, ctx }): Promise<PagedAccessObject> {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        switch (response.doc.type) {
          case "manifest":
            return toPagedManifest(response.doc);
          case "collection":
            return toPagedCollection(response.doc);
          case "pdf":
            return response.doc as Pdf;
        }
      }
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
    },
  })
  .query("getMembership", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      try {
        return await ctx.couch.access.getMembership(id);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("getAncestry", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      try {
        return await ctx.couch.access.getAncestry(id);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("getChacheStatus", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      try {
        return await ctx.couch.access.getChacheStatus(id);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("publish", {
    input: NoidWithUser.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.publish(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("unpublish", {
    input: NoidWithUser.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.unpublish(input);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("delete", {
    input: z.object({ id: Noid, user: User }).parse,
    async resolve({ input: { id, user }, ctx }) {
      try {
        const accessObj = await ctx.couch.access.get(id);

        /* Delete files from access-files */

        // Check if the OCR field exists, if so we know to delete it
        if ("ocrPdf" in accessObj && accessObj.ocrPdf?.extension) {
          const fileName = `${accessObj.id}/${accessObj.ocrPdf.extension}`;
          try {
            await ctx.swift.accessFiles.deleteObject(fileName);
          } catch (e: any) {
            console.log(e?.message);
          }
        }

        // Check if the file field exists, if so we know to delete it
        if ("file" in accessObj && accessObj.file?.extension) {
          const fileName = `${accessObj.id}/${accessObj.file.extension}`;
          try {
            await ctx.swift.accessFiles.deleteObject(fileName);
          } catch (e: any) {
            console.log(e?.message);
          }
        }

        /* If the dmdType exists, we know to delete metadata from access-metadata */
        if (accessObj?.dmdType) {
          let metadataFileName: string | null = "";
          try {
            metadataFileName = getItemMetadataXMLFileName(
              id,
              accessObj.dmdType
            );
            if (metadataFileName) {
              await ctx.swift.accessMetadata.deleteObject(metadataFileName);
            } else {
              console.log("Could not determine name of metadata file.");
            }
          } catch (e: any) {
            console.log(e?.message);
          }
        }

        const membership = await ctx.couch.access.getMembership(id);

        /* Delete from database if other steps did not throw */
        await ctx.couch.access.delete({
          document: id,
        });

        if (membership?.length) {
          const ids: string[] = membership
            .filter((collection) => typeof collection.id !== "undefined")
            .map((collection) => collection.id);

          for (const collectionId of ids) {
            await ctx.couch.access.processList({
              id: collectionId,
              command: ["remove", [id]],
              user,
            });

            // I think that I have to call this even for unordered collections
            await ctx.couch.access.bulkForceUpdateAllMembers(collectionId);
          }
        }

        return { success: true };
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  });
