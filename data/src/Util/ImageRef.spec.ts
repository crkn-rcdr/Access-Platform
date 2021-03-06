import test from "ava";
import { Validator } from "../Validator";

import { ImageRef, schema } from "./ImageRef";

const validate = new Validator().compile(schema);

test("ImageRef schema validates an image specified by path", (t) => {
  t.is(
    validate({
      height: 3350,
      path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
      mime: "image/jpeg",
      width: 2575,
      size: 433137,
    } as ImageRef),
    true
  );
});

test("ImageRef schema validates an image specified by extension", (t) => {
  t.is(
    validate({
      height: 3350,
      extension: "jpg",
      mime: "image/jpeg",
      width: 2575,
      size: 433137,
    } as ImageRef),
    true
  );
});

test("ImageRef schema invalidates an image with neither path nor extension", (t) => {
  t.is(
    validate({
      height: 3350,
      mime: "image/jpeg",
      width: 2575,
      size: 433137,
    }),
    false
  );
});

test("ImageRef schema does not require height/width", (t) => {
  t.is(
    validate({
      path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
      mime: "image/jpeg",
      size: 433137,
    } as ImageRef),
    true
  );
});

test("ImageRef schema requires both height and width", (t) => {
  t.is(
    validate({
      height: 3350,
      path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
      mime: "image/jpeg",
      size: 433137,
    } as ImageRef),
    false
  );
  t.is(
    validate({
      path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
      mime: "image/jpeg",
      width: 2575,
      size: 433137,
    } as ImageRef),
    false
  );
});

test("ImageRef schema requires mime", (t) => {
  t.is(
    validate({
      height: 3350,
      path: "ooe.sas_19720816EP/data/sip/data/files/ooe.19720816EP0001.jpg",
      width: 2575,
      size: 433137,
    }),
    false
  );
});
