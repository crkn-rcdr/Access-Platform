import test from "ava";

import { fromCouch } from "./Couch";

import { Canvas } from "./Access/Canvas";
import { CanvasManifest } from "./Access/Manifest/Canvases";
import { PdfManifest } from "./Access/Manifest/Pdf";
import { Collection } from "./Access/Collection";
import { Alias } from "./Access/Alias";
import { validate } from "./Access";

export const testCanvas: Canvas = fromCouch({
  _id: "69429/c00000000220",
  _rev: "1-f9810f31b9628858ac049a872e52230c",
  ocrType: "alto",
  ocrPdf: {
    path: "oocihm.8_00006_5/data/sip/data/files/7753.pdf",
    size: 420687,
  },
  master: {
    size: 776737,
    width: 1536,
    path: "oocihm.8_00006_5/data/sip/data/files/7753.jpg",
    mime: "image/jpeg",
    height: 2288,
  },
  source: {
    from: "cihm",
    path: "oocihm.8_00006_5/data/sip/data/files/7753.jpg",
  },
});

test("Access schema validates a Canvas", (t) => {
  const valid = validate(testCanvas);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});

export const testCanvasManifest: CanvasManifest = fromCouch({
  _id: "69429/m02n4zg6h671",
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
});

test("Access schema validates a CanvasManifest", (t) => {
  const valid = validate(testCanvasManifest);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});

export const testPdfManifest: PdfManifest = fromCouch({
  _id: "69429/m0v40js9ht3k",
  _rev: "13-4fce0a4d3af3bd8f35d3fe180b6ebe69",
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
});

test("Access schema validates a PdfManifest", (t) => {
  const valid = validate(testPdfManifest);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});

export const testCollection: Collection = fromCouch({
  _id: "69429/s0vq2s46j98h",
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
});

test("Access schema validates a Collection", (t) => {
  const valid = validate(testCollection);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});

export const testAlias: Alias = fromCouch({
  _id: "69429/m02n4zg6h671",
  type: "alias",
  slug: "typoOfSorts",
  to: "69429/m0696zw19t6s",
});

test("Access schema validates an Alias", (t) => {
  const valid = validate(testAlias);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
