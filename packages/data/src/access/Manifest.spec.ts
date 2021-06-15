import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./Manifest";
import { isManifest } from ".";
import { testGuard, testPdfManifest, testCanvasManifest } from "./common.spec";

const { isValid } = tester(validate);

test("Manifest schema validates a CanvasManifest", isValid, testCanvasManifest);
test("Manifest schema validates a PdfManifest", isValid, testPdfManifest);

test(
  "isManifest discerns Manifests from other objects",
  testGuard,
  isManifest,
  "manifest"
);
