import test from "ava";
import Validator from "../../Validator";

import { CanvasManifest, schema } from "./Canvases";

const validate = new Validator().compile(schema);

const manifest: CanvasManifest = {
  id: "69429/m02n4zg6h671",
  _rev: "14-12f0cda072e2f32e6efb4315220b7a88",
  type: "manifest",
  public: "2020-08-29T23:26:06Z",
  updateInternalmeta: {
    succeeded: true,
    message: "",
    requestDate: "2021-01-13T18:44:55Z",
    processDate: "2021-01-17T18:43:18Z",
  },
  slug: "oocihm.8_06941_2",
  label: {
    none: "The Pacific Harbor Light: Vol. I, No. 2 (October 24, 1891)",
  },
  dmdType: "issueinfo",
  from: "canvases",
  behavior: "paged",
  canvases: [
    {
      label: { none: "1" },
      id: "69429/c08s4jp15g01",
    },
    {
      label: { none: "2" },
      id: "69429/c0513tw3hp7p",
    },
    {
      label: { none: "3" },
      id: "69429/c0183435vx78",
    },
    {
      label: { none: "4" },
      id: "69429/c0wh2d987m77",
    },
    {
      id: "69429/c0rr1pj0kv4w",
      label: { none: "5" },
    },
    {
      label: { none: "6" },
      id: "69429/c0n00zr2z33x",
    },
    {
      id: "69429/c0h98zb84g4k",
      label: { none: "7" },
    },
    {
      id: "69429/c0cj87k0gq3s",
      label: { none: "8" },
    },
  ],
};

test("CanvasManifest schema validates a CanvasManifest", (t) => {
  const valid = validate(manifest);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
