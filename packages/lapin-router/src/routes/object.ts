import { Collection, Manifest, Noid } from "@crkn-rcdr/access-data";
import { createRouter } from "../router.js";
import { deletedDiff } from "deep-object-diff";

export const objectRouter = createRouter().mutation("insert", {
  input: (value: any) => {
    if (
      typeof value === "object" &&
      value.hasOwnProperty("id") &&
      Noid.safeParse(value.id).success &&
      value.hasOwnProperty("data")
    ) {
      try {
        /* Step 1 - make sure any valid keys passed in are formatted correctly */
        const manifestTest = Manifest.partial();
        const manifestTestResult = manifestTest.parse(value.data);

        const collectionTest = Collection.partial();
        const collectionTestResult = collectionTest.parse(value.data);

        const testRes = { ...manifestTestResult, ...collectionTestResult };

        /* Step 2 - catch any invalid keys */
        const testDifference = deletedDiff(value.data, testRes);
        if (typeof value === "object") {
          const invalidKeys = Object.keys(testDifference);
          if (invalidKeys.length)
            throw `Data to update contained keys that do not belong to either a Collection or a Manifest. Invalid keys: ${invalidKeys.toString()}`;
        } else throw "Could not check for invalid keys in data.";
      } catch (e) {
        throw e; // Zod parser error will occur if the values for valid keys in the data fail their validation
      }
      // All is well, continue processing the save operation
      return value;
    } else
      throw "Malformatted Input. Body should be a json object in the form of: { id: noid, data : { keyToUpdate : newValue } }.";
  },
  async resolve({ input: q, ctx }): Promise<any> {
    try {
      const response = await ctx.couch.access.updateWithSubset(q?.id, q.data);
      return response;
    } catch (e) {
      throw e; // Catch any issues with updating the database
    }
  },
});
