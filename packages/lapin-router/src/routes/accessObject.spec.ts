import anyTest, { TestInterface } from "ava";
//import { BaseContext, getTestContext } from "../../../couch-utils/src/test";

import { LapinRouter, router } from "../router.js";
import { LapinContext } from "../context.js";

//type LapinRouterContext = BaseContext & { lapin: LapinContext };
const test = anyTest as TestInterface<{
  lapin: LapinRouter;
  context: LapinContext;
}>;
const COLLECTION = "69429/s0vq2s46j98h";
const COLLECTION_SLUG = "oocihm.8_06941";
const SLUG_SEARCH = "http://172.30.0.51:5858/slug.search"; //Is the path correct to for the first test in accessObject to pass?
const SLUG_PUBLISH = "http://172.30.0.51:5858/slug.publish";
test.serial("Lapin couch context reachable", async (t) => {
  const result = await t.context.lapin.query(SLUG_SEARCH,{
     procedure:COLLECTION_SLUG
  }); // this should take in the query path,

  t.deepEqual(result["resolved path"], { error: "Unresolved Path" });
});
test.serial("Publish a slug", async (t) => {
  const result = await t.context.lapin.mutation(SLUG_PUBLISH, {
    procedure: COLLECTION
  });
  t.deepEqual(result["published slug"],{error: "unresolved path"})
})
