import test from "ava";
import { tester } from "../testHelper.js";
import { Collection, toPagedCollection } from "./Collection.js";

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
  members: [
    {
      id: "69429/m0696zw19t6s",
      label: { none: "Vol. I, No. 1 (October 17, 1891)" },
    },
    {
      id: "69429/m02n4zg6h671",
      label: { none: "Vol. I, No. 2 (October 24, 1891)" },
    },
  ],
};

test("Collection parses valid data", isValid, testCollection);

test("Collections can be paged", (t) => {
  t.deepEqual(toPagedCollection(testCollection).members, {
    first: "69429/m0696zw19t6s",
    last: "69429/m02n4zg6h671",
    count: 2,
  });
});
