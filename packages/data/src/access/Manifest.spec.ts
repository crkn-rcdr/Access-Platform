import test from "ava";
import { tester } from "../testHelper.js";

import { Manifest, PagedManifest, toPagedManifest } from "./Manifest.js";
import { ObjectListHandler } from "./util/ObjectList.js";

const { isValid } = tester(Manifest);

export const testManifest: Manifest = {
  id: "69429/m02n4zg6h671",
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

const testPagedManifest: PagedManifest = {
  ...testManifest,
  canvases: {
    first: "69429/c08s4jp15g01",
    last: "69429/c0cj87k0gq3s",
    count: 8,
  },
};

test("Manifest schema validates a Manifest", isValid, testManifest);

test("Manifests can be paged", (t) => {
  const pm = toPagedManifest(testManifest);
  t.deepEqual(pm, testPagedManifest);

  const list = new ObjectListHandler(testManifest.canvases);

  const firstPage = list.pageAfter(null, 4);
  t.deepEqual(firstPage.list, testManifest.canvases.slice(0, 4));
  const secondPage = list.pageAfter(firstPage.last, 4);
  t.deepEqual(secondPage.list, testManifest.canvases.slice(4, 8));

  const frPage = list.pageBefore(null, 5);
  t.deepEqual(frPage.list, testManifest.canvases.slice(3, 8));
  const srPage = list.pageBefore(frPage.first, 5);
  t.deepEqual(srPage.list, testManifest.canvases.slice(0, 3));
});
