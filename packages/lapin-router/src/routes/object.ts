import {
  Collection,
  EditableCollection,
  EditableManifest,
  Manifest,
  Noid,
} from "@crkn-rcdr/access-data";
import { createRouter } from "../router.js";
import { deletedDiff } from "deep-object-diff";
import { z } from "zod";
/*
input: ,
*/
const UpdateDataType = z.object({
  id: Noid,
  data: z.any(),
});
type UpdateDataType = z.infer<typeof UpdateDataType>;

const InsertDataType = z.object({
  data: z.any(),
});
type InsertDataType = z.infer<typeof InsertDataType>;

export const objectRouter = createRouter()
  .mutation("insert", {
    input: (value: unknown) => {
      try {
        // Step 1 - make sure the body object was formatted correctly
        const bodyTestResult = UpdateDataType.parse(value);
        console.log("bodyTestResult", bodyTestResult);

        // Step 2 - make sure any valid keys passed in are formatted correctly
        const manifestTest = EditableManifest.partial();
        const manifestTestResult = manifestTest.parse(
          (<UpdateDataType>value).data
        );

        const collectionTest = EditableCollection.partial();
        const collectionTestResult = collectionTest.parse(
          (<UpdateDataType>value).data
        );

        const testRes = { ...manifestTestResult, ...collectionTestResult };

        // Step 3 - catch any invalid keys
        const testDifference = deletedDiff(
          (<UpdateDataType>value).data,
          testRes
        );
        if (typeof value === "object") {
          const invalidKeys = Object.keys(testDifference);
          if (invalidKeys.length)
            throw `Data to update contained keys that do not belong to either a Collection or a Manifest, or ones that should not be updated. Invalid keys: ${invalidKeys.toString()}`;
        } else throw "Could not check for invalid keys in data.";

        // All is well, continue processing the save operation
        console.log("Validated...", value);
        return value;
      } catch (e) {
        throw e; // Zod parser error will occur if the values for valid keys in the data fail their validation
      }
    },
    async resolve({ input: q, ctx }): Promise<any> {
      try {
        console.log("q", q);
        const response = await ctx.couch.access.updateWithSubset(
          (<UpdateDataType>q).id,
          (<UpdateDataType>q).data
        );
        return response;
      } catch (e) {
        throw e; // Catch any issues with updating the database
      }
    },
  })
  //TODO: figure out noid id service
  .mutation("manifestInsert", {
    input: (value: unknown) => {
      try {
        // Step 1 - make sure the body object was formatted correctly
        const bodyTestResult = InsertDataType.parse(value);
        console.log("bodyTestResult", bodyTestResult);

        // Step 2 - make sure any valid keys passed in are formatted correctly
        const manifestTest = Manifest.partial();
        const testRes = manifestTest.parse((<InsertDataType>value).data);

        // Step 3 - catch any invalid keys
        const testDifference = deletedDiff(
          (<InsertDataType>value).data,
          testRes
        );
        if (typeof value === "object") {
          const invalidKeys = Object.keys(testDifference);
          if (invalidKeys.length)
            throw `Data to update contained keys that do not belong to a Manifest. Invalid keys: ${invalidKeys.toString()}`;
        } else throw "Could not check for invalid keys in data.";

        // All is well, continue processing the save operation
        console.log("Validated...", value);
        return value;
      } catch (e) {
        throw e; // Zod parser error will occur if the values for valid keys in the data fail their validation
      }
    },
    async resolve({ input: q, ctx }): Promise<any> {
      try {
        console.log("q", q);
        const response = await ctx.couch.access.insertNew(
          (<InsertDataType>q).data
        );
        return response;
      } catch (e) {
        throw e; // Catch any issues with updating the database
      }
    },
  })
  .mutation("collectionInsert", {
    input: (value: unknown) => {
      try {
        // Step 1 - make sure the body object was formatted correctly
        const bodyTestResult = InsertDataType.parse(value);
        console.log("bodyTestResult", bodyTestResult);

        // Step 2 - make sure any valid keys passed in are formatted correctly
        const collectionTest = Collection.partial();
        const testRes = collectionTest.parse((<InsertDataType>value).data);
        // Step 3 - catch any invalid keys
        const testDifference = deletedDiff(
          (<InsertDataType>value).data,
          testRes
        );
        if (typeof value === "object") {
          const invalidKeys = Object.keys(testDifference);
          if (invalidKeys.length)
            throw `Data to update contained keys that do not belong to a Collection. Invalid keys: ${invalidKeys.toString()}`;
        } else throw "Could not check for invalid keys in data.";

        // All is well, continue processing the save operation
        console.log("Validated...", value);
        return value;
      } catch (e) {
        throw e; // Zod parser error will occur if the values for valid keys in the data fail their validation
      }
    },
    async resolve({ input: q, ctx }): Promise<any> {
      try {
        console.log("q", q);
        const response = await ctx.couch.access.insertNew(
          (<InsertDataType>q).data
        );
        return response;
      } catch (e) {
        throw e; // Catch any issues with updating the database
      }
    },
  });
