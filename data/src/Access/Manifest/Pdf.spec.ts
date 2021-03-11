import test from "ava";

import { PdfManifest, validate } from "./Pdf";

export const testPdfManifest: PdfManifest = {
  id: "69429/m0v40js9ht3k",
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
};

test("PdfManifest schema validates a PdfManifest", (t) => {
  const valid = validate(testPdfManifest);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
