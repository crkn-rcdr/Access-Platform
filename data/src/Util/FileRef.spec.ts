import test from "ava";
import Validator from "../Validator";

import { FileRef, schema } from "./FileRef";

const validate = new Validator().compile(schema);

test("FileRef schema validates a legacy repo file", (t) => {
  t.is(
    validate({
      path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
      size: 100000,
      mime: "image/jpeg",
    } as FileRef),
    true
  );
});

test("FileRef schema validates a file specified by extension", (t) => {
  t.is(
    validate({
      extension: "tiff",
      size: 200000,
      mime: "image/tiff",
    } as FileRef),
    true
  );
});

test("ProcessUpdate schema validates a file with no path/extension", (t) => {
  t.is(
    validate({
      size: 525252,
      mime: "application/pdf",
    } as FileRef),
    true
  );
});

test("ProcessUpdate schema invalidates an object with both path and extension specified", (t): void => {
  t.is(
    validate({
      path: "/path/to/file.jpg",
      extension: "jpg",
      size: 525252,
      mime: "image/jpeg",
    }),
    false
  );
});
