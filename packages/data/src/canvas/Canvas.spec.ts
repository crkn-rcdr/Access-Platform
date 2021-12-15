import test from "ava";
import { tester } from "../testHelper.js";

import { Canvas } from "./Canvas.js";

const { isValid } = tester(Canvas);

const testCanvas: Canvas = {
  id: "69429/c00000000220",
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
};

test("Canvas schema validates a Canvas", isValid, testCanvas);
