import test from "ava";
import { tester } from "../common.spec";

import { ImageRef, validate } from "./ImageRef";

const { isValid, isInvalid } = tester(validate);

test("ImageRef schema validates an image specified by path", isValid, {
  height: 3350,
  path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
  mime: "image/jpeg",
  width: 2575,
  size: 433137,
} as ImageRef);

test("ImageRef schema validates an image specified by extension", isValid, {
  height: 3350,
  extension: "jpg",
  mime: "image/jpeg",
  width: 2575,
  size: 433137,
} as ImageRef);

test(
  "ImageRef schema invalidates an image with neither path nor extension",
  isInvalid,
  {
    height: 3350,
    mime: "image/jpeg",
    width: 2575,
    size: 433137,
  }
);

test("ImageRef schema does not require height/width", isValid, {
  path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
  mime: "image/jpeg",
  size: 433137,
} as ImageRef);

test("ImageRef schema invalidates height without width", isInvalid, {
  height: 3350,
  path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
  mime: "image/jpeg",
  size: 433137,
} as ImageRef);

test("ImageRef schema invalidates width without height", isInvalid, {
  path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
  mime: "image/jpeg",
  width: 2575,
  size: 433137,
} as ImageRef);

test("ImageRef schema requires mime", isInvalid, {
  height: 3350,
  path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
  width: 2575,
  size: 433137,
});
