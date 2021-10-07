import anyTest, { TestInterface } from "ava";
//import { BaseContext, getTestContext } from "../../../couch-utils/src/test";

import { LapinRouter, router } from "../router.js";
import { LapinContext } from "../context.js";


//type LapinRouterContext = BaseContext & { lapin: LapinContext };
const test = anyTest as TestInterface<{ lapin: LapinRouter, context: LapinContext}>;

test.serial("Lapin couch context reachable", async (t) => {
  const result = await t.context.lapin.query({ "69429/s0vq2s46j98h" }); // this should take in the query path,

  t.deepEqual(result["resolved path"], { error: "Unresolved Path" });
  })
