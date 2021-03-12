import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./CanvasManifest";
import { testCanvasManifest } from "./common.spec";

const { isValid } = tester(validate);

test(
  "CanvasManifest schema validates a CanvasManifest",
  isValid,
  testCanvasManifest
);
