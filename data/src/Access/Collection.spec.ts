import test from "ava";
import Validator from "../Validator";

import Collection, { schema } from "./Collection";

const validate = new Validator().compile(schema);

const collection: Collection = {
  id: "69429/s0vq2s46j98h",
  _rev: "71-0181037663f0d8cb27a328d6d9aa6da7",
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

test("Collection schema validates a Collection", (t) => {
  const valid = validate(collection);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
