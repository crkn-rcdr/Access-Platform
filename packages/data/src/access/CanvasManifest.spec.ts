import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./CanvasManifest";
import { isCanvasManifest } from ".";
import { testCanvasManifest, testGuard } from "./common.spec";

const { isValid } = tester(validate);

test(
  "CanvasManifest schema validates a CanvasManifest",
  isValid,
  testCanvasManifest
);

test(
  "isCanvasManifest discerns CanvasManifests from other objects",
  testGuard,
  isCanvasManifest,
  "canvasManifest"
);
