import { Collection, Manifest, Noid } from "@crkn-rcdr/access-data";
import { createRouter } from "../router.js";
import { deletedDiff } from "deep-object-diff";
import { z } from "zod";
/*
input: ,
*/
const DataType = z.object({
  id: Noid,
  data: z.any(),
});
type DataType = z.infer<typeof DataType>;

export const objectRouter = createRouter()
  .mutation("insert", {
    input: (value: unknown) => {
      try {
        /* Step 1 - make sure the body object was formatted correctly */
        const bodyTestResult = DataType.parse(value);
        console.log("bodyTestResult", bodyTestResult);

        /* Step 2 - make sure any valid keys passed in are formatted correctly */
        const manifestTest = Manifest.partial();
        const manifestTestResult = manifestTest.parse((<DataType>value).data);

        const collectionTest = Collection.partial();
        const collectionTestResult = collectionTest.parse(
          (<DataType>value).data
        );

        const testRes = { ...manifestTestResult, ...collectionTestResult };

        /* Step 3 - catch any invalid keys */
        const testDifference = deletedDiff((<DataType>value).data, testRes);
        if (typeof value === "object") {
          const invalidKeys = Object.keys(testDifference);
          if (invalidKeys.length)
            throw `Data to update contained keys that do not belong to either a Collection or a Manifest. Invalid keys: ${invalidKeys.toString()}`;
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
          (<DataType>q).id,
          (<DataType>q).data
        );
        return response;
      } catch (e) {
        throw e; // Catch any issues with updating the database
      }
    },
  })
  .mutation("replace", {
    input: (value: unknown) => {
      try {
        /* Step 1 - make sure any valid keys passed in are formatted correctly */
        const manifestTestResult = Manifest.safeParse(<DataType>value);
        const collectionTestResult = Collection.safeParse(<DataType>value);

        if (manifestTestResult.success || collectionTestResult.success) {
          // All is well, continue processing the save operation
          return value;
        } else
          throw `Input must be a valid Manifest or Collection. Manifest Test Error: ${manifestTestResult.error?.toString()} Collection Test Error: ${collectionTestResult.error?.toString()}`;
      } catch (e) {
        throw e; // Zod parser error will occur if the values for valid keys in the data fail their validation
      }
    },
    async resolve({ input: q, ctx }): Promise<any> {
      try {
        console.log("q", q);
        const response = await ctx.couch.access.update(<Record<string, any>>q);
        return response;
      } catch (e) {
        throw e; // Catch any issues with updating the database
      }
    },
  });
