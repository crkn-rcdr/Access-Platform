import test from "ava";
import { tester } from "../testHelper.js";

import { Manifest, PagedManifest, toPagedManifest } from "./Manifest.js";
import { ObjectList, ObjectListHandler } from "./util/ObjectList.js";

const { isValid } = tester(Manifest);

const testPdfManifest: Manifest = {
  id: "69429/m0v40js9ht3k",
  type: "manifest",
  from: "pdf",
  dmdType: "dc",
  pageLabels: [
    {
      none: "Image 1",
    },
    {
      none: "Image 2",
    },
  ],
  file: {
    size: 779098,
    path: "numeris.RD_2009_SP00_042/data/sip/data/files/document.pdf",
  },
  label: {
    none: "Just a label.",
  },
  slug: "numeris.RD_2009_SP00_042",
  updateInternalmeta: {
    succeeded: true,
    message: "",
    requestDate: "2021-01-14T02:28:24Z",
    processDate: "2021-01-14T16:30:02Z",
  },
  updated: "2021-01-14T16:30:02Z",
  public: "2020-08-29T23:42:13Z",
};

export const testCanvasManifest: Manifest = {
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

const testPagedManifest: PagedManifest = {
  ...testCanvasManifest,
  canvases: {
    first: "69429/c08s4jp15g01",
    last: "69429/c0cj87k0gq3s",
    count: 8,
  },
};

test("Manifest schema validates a CanvasManifest", isValid, testCanvasManifest);
test("Manifest schema validates a PdfManifest", isValid, testPdfManifest);

test("Canvasesless manifests don't get paged", (t) => {
  t.is(toPagedManifest(testPdfManifest).canvases, null);
});

test("Canvas manifests can be paged", (t) => {
  const pm = toPagedManifest(testCanvasManifest);
  t.deepEqual(pm, testPagedManifest);

  const list = new ObjectListHandler(testCanvasManifest.canvases as ObjectList);

  const firstPage = list.nextPage(null, 4);
  t.deepEqual(firstPage.list, testCanvasManifest.canvases?.slice(0, 4));
  const secondPage = list.nextPage(firstPage.last, 4);
  t.deepEqual(secondPage.list, testCanvasManifest.canvases?.slice(4, 8));

  const frPage = list.previousPage(null, 5);
  t.deepEqual(frPage.list, testCanvasManifest.canvases?.slice(3, 8));
  const srPage = list.previousPage(frPage.first, 5);
  t.deepEqual(srPage.list, testCanvasManifest.canvases?.slice(0, 3));
});
