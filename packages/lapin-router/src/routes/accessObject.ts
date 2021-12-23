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
  Manifest,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { getDmdTaskItemXMLFileName } from "../util/dmdTask.js";

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
      console.log("One");
      const response = await ctx.couch.access.getSafe(id);
      console.log("heree", response);
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
  .mutation("unassignSlug", {
    input: NoidWithUser.parse,
    async resolve({ input, ctx }) {
      try {
        await ctx.couch.access.unassignSlug({
          id: input.id,
          user: input.user,
        });
        const response = await ctx.couch.access.getSafe(input.id);
        if (response.found) {
          if (response.doc.public) {
            await ctx.couch.access.unpublish({
              id: input.id,
              user: input.user,
            });
          }
        }
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("delete", {
    input: Noid.parse,
    async resolve({ input: id, ctx }) {
      try {
        const accessObj = await ctx.couch.access.get(id);
        console.log(accessObj);

        /* Delete files */
        if (accessObj?.type === "manifest") {
          const manifest = Manifest.parse(accessObj);
          if (manifest.ocrPdf?.extension) {
            // Check if the file exists
            let fileExistsOnSwift = false;
            const fileName = `${manifest.id}/${manifest.ocrPdf.extension}`;
            try {
              await ctx.swift.accessFiles.getObject(fileName);
              fileExistsOnSwift = true;
            } catch (e: any) {
              console.log(e?.message, "No files found on swift.");
            }

            // If it does remove it from swift
            if (fileExistsOnSwift) {
              console.log("Files exist on swift. Deleting...");
              await ctx.swift.accessFiles.deleteObject(fileName);
            }
          } else {
            console.log("No file to delete.");
          }
        } else if (accessObj?.type === "pdf") {
          const pdf = Pdf.parse(accessObj);
          if (pdf.file?.extension) {
            // Check if the file exists
            let fileExistsOnSwift = false;
            const fileName = `${pdf.id}/${pdf.file.extension}`;
            try {
              await ctx.swift.accessFiles.getObject(fileName);
              fileExistsOnSwift = true;
            } catch (e: any) {
              console.log(e?.message, "No files found on swift.");
            }

            // If it does remove it from swift
            if (fileExistsOnSwift) {
              console.log("Files exist on swift. Deleting...");
              await ctx.swift.accessFiles.deleteObject(fileName);
            }
          } else {
            console.log("No file to delete.");
          }
        }

        /* Delete metadata */
        if (accessObj?.dmdType) {
          let metadataExistsOnSwift = false;
          let metadataFileName: string | null = "";
          try {
            metadataFileName = getDmdTaskItemXMLFileName(id, accessObj.dmdType);
            if (metadataFileName) {
              await ctx.swift.accessMetadata.getObject(metadataFileName);
              metadataExistsOnSwift = true;
            } else {
              console.log("Could not determine name of metadata file.");
            }
          } catch (e: any) {
            console.log(e?.message, "No metadata to delete.");
          }

          if (metadataExistsOnSwift && metadataFileName) {
            console.log("Metadata exists on swift. Deleting...");
            await ctx.swift.accessMetadata.deleteObject(metadataFileName);
          }
        }

        /* Delete from database if other steps did not throw */
        await ctx.couch.access.delete({
          document: id,
        });

        return { success: true };
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  });
