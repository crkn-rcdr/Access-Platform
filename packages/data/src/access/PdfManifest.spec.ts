import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./PdfManifest";
import { isPdfManifest } from ".";
import { testGuard, testPdfManifest } from "./common.spec";

const { isValid } = tester(validate);

test("PdfManifest schema validates a PdfManifest", isValid, testPdfManifest);

test(
  "isPdfManifest discerns PdfManifests from other objects",
  testGuard,
  isPdfManifest,
  "pdfManifest"
);
