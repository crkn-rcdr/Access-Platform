import test from "ava";
import { tester } from "../common.spec";

import { toCouch } from "./util";
import { validate } from "./access";

import {
  testAlias,
  testCanvasManifest,
  testCollection,
  testPdfManifest,
} from "../access/common.spec";

const { isValid } = tester(validate);

test(
  "Access couch schema validates a Manifest document from canvases",
  isValid,
  toCouch(testCanvasManifest)
);

test(
  "Access couch schema validates a Manifest document from a pdf",
  isValid,
  toCouch(testPdfManifest)
);

test(
  "Access couch schema validates a Collection document",
  isValid,
  toCouch(testCollection)
);

test(
  "Access couch schema validates an Alias document",
  isValid,
  toCouch(testAlias)
);
