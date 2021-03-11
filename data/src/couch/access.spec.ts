import test from "ava";

import { toCouch } from "./util";
import { validate } from "./access";

import { testCanvasManifest } from "../access/CanvasManifest.spec";
import { testPdfManifest } from "../access/PdfManifest.spec";
import { testCollection } from "../access/Collection.spec";
import { testAlias } from "../access/Alias.spec";

test("Access couch schema validates a CanvasManifest document", (t) => {
  const valid = validate(toCouch(testCanvasManifest));
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});

test("Access couch schema validates a PdfManifest document", (t) => {
  const valid = validate(toCouch(testPdfManifest));
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});

test("Access couch schema validates a Collection document", (t) => {
  const valid = validate(toCouch(testCollection));
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});

test("Access couch schema validates an Alias document", (t) => {
  const valid = validate(toCouch(testAlias));
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
