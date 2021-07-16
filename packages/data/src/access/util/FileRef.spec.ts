import test from "ava";
import { tester } from "../../testHelper.js";
import { FileRef } from "./FileRef.js";

const { isInvalid, isValid } = tester(FileRef);

test("FileRef schema validates a legacy repo file", isValid, {
  path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
  size: 100000,
  mime: "image/jpeg",
});

test("FileRef schema validates a file specified by extension", isValid, {
  extension: "tiff",
  size: 200000,
  mime: "image/tiff",
});

test("FileRef schema validates a file with no path/extension", isValid, {
  size: 525252,
  mime: "application/pdf",
});

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
