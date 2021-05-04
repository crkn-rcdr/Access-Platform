import test from "ava";
import { tester } from "../common.spec";

import { toCouch } from "./util";
import { validate } from "./canvas";

import { testCanvas } from "../access/common.spec";

const { isValid } = tester(validate);

test(
  "Canvas couch schema validates a canvas document",
  isValid,
  toCouch(testCanvas)
);
