import test from "ava";

import { Canvas, validate } from "./Canvas";

const canvas = {
  id: "69429/c00000000220",
  _rev: "1-f9810f31b9628858ac049a872e52230c",
  ocrType: "alto",
  ocrPdf: {
    path: "oocihm.8_00006_5/data/sip/data/files/7753.pdf",
    size: 420687,
  },
  master: {
    size: 776737,
    width: 1536,
    path: "oocihm.8_00006_5/data/sip/data/files/7753.jpg",
    mime: "image/jpeg",
    height: 2288,
  },
  source: {
    from: "cihm",
    path: "oocihm.8_00006_5/data/sip/data/files/7753.jpg",
  },
} as Canvas;

test("Canvas schema validates a Canvas", (t) => {
  const valid = validate(canvas);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
