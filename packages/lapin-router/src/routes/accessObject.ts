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
        /* Delete from database*/
        /*const resDb = await ctx.couch.access.delete({
          document: id,
        });*/

        /*
          Deleting an access object should also delete associated files in Swift; specifically, any associated descriptive metadata files and PDFs. Objects with these associated files will have fields in the database that indicate this.
  
          Anything associated with that OID in access-files and access-metadata should also be deleted.
  
          CIHM::Smelter will accept access deposit requests from a queue, retrieve the relevant data from the preservation platform, split and manipulate preservation METS records, and store the results in Swift using the following scheme.
  
          /v1/AUTH_crkn/access-metadata/$noid
          /dmdMARC.xml
          /dmdDC.xml
          /dmdISSUEINFO.xml
          /ocrALTO.xml
          /ocrTXTMAP.xml

          /v1/AUTH_crkn/access-files/$noid.$ext
          Couch databases for collections, manifests, and canvases will be populated with the required information to link these objects together.
        */

        let filesExistOnSwift = false;

        try {
          //ocrPdf
          //dmdType
          /*let file = await ctx.swift.accessFiles.getObject(
            "69429/m0000000005b.pdf"
          );
          console.log(file);*/

          let files = await ctx.swift.accessFiles.listObjects();
          console.log(files);

          filesExistOnSwift = true;
        } catch (e: any) {
          console.log(e?.message, "No files on swift.");
        }

        if (filesExistOnSwift) {
          console.log("Files exist on swift. Deleting...");
        }

        let metadataExistsOnSwift = false;

        try {
          let metadata = await ctx.swift.accessMetadata.getObject(
            "69429/m0000000005b"
          );
          console.log(metadata);
          metadataExistsOnSwift = true;
        } catch (e: any) {
          console.log(e?.message, "No metadata exists on swift.");
        }

        if (metadataExistsOnSwift) {
          console.log("Metadata exists on swift. Deleting...");
        }

        /*const resSwiftFiles = await ctx.swift.accessFiles.deleteObject(
          input.id
        );

        const resSwiftMetadata = await ctx.swift.accessMetadata.deleteObject(
          input.id
        );*/
        console.log("swift");
        return { success: true }; //, resDb };
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  });
