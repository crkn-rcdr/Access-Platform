import test from "ava";

import { toCouch } from "../Couch";
import { validate } from "./Access";

import { testCanvasManifest } from "../Access/Manifest/Canvases.spec";
import { testPdfManifest } from "../Access/Manifest/Pdf.spec";
import { testCollection } from "../Access/Collection.spec";
import { testAlias } from "../Access/Alias.spec";

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
