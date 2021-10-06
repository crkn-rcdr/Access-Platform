import test from "ava";
import { tester } from "../testHelper.js";
import { Collection } from "./Collection.js";

const { isValid } = tester(Collection);

const testCollection: Collection = {
  id: "69429/s0vq2s46j98h",
  type: "collection",
  public: "2020-03-03T18:43:17Z",
  updateInternalmeta: {
    succeeded: true,
    processDate: "2020-09-17T06:01:50Z",
    requestDate: "2020-09-17T04:22:24Z",
    message: "",
  },
  slug: "oocihm.8_06941",
  label: {
    none: "The Pacific Harbor Light",
  },
  dmdType: "dc",
  behavior: "multi-part",
};

test("Collection parses valid data", isValid, testCollection);
