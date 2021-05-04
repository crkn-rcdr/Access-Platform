import test from "ava";
import { tester } from "../common.spec";

import { FileRef, validate } from "./FileRef";

const { isValid, isInvalid } = tester(validate);

test("FileRef schema validates a legacy repo file", isValid, {
  path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
  size: 100000,
  mime: "image/jpeg",
} as FileRef);

test("FileRef schema validates a file specified by extension", isValid, {
  extension: "tiff",
  size: 200000,
  mime: "image/tiff",
} as FileRef);

test("FileRef schema validates a file with no path/extension", isValid, {
  size: 525252,
  mime: "application/pdf",
} as FileRef);

test(
  "FileRef schema invalidates an object with both path and extension specified",
  isInvalid,
  {
    path: "/path/to/file.jpg",
    extension: "jpg",
    size: 525252,
    mime: "image/jpeg",
  }
);
