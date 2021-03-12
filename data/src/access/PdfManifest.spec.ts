import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./PdfManifest";
import { testPdfManifest } from "./common.spec";

const { isValid } = tester(validate);

test("PdfManifest schema validates a PdfManifest", isValid, testPdfManifest);
