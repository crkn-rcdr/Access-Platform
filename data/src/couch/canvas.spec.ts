import test from "ava";

import { toCouch } from "./util";
import { validate } from "./canvas";

import { testCanvas } from "../access/Canvas.spec";

test("Canvas couch schema validates a canvas document", (t) => {
  const valid = validate(toCouch(testCanvas));
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});