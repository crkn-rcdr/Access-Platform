import test from "ava";
import { tester } from "../testHelper.js";

import { Pdf } from "./Pdf.js";

const { isValid } = tester(Pdf);

const testPdf: Pdf = {
  id: "69429/m0v40js9ht3k",
  type: "pdf",
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

test("Pdf schema validates a Pdf", isValid, testPdf);
