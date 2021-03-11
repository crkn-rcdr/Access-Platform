import test from "ava";

import { toCouch } from "../Couch";
import { validate } from "./Canvas";

import { testCanvas } from "../Access/Canvas.spec";

test("Canvas couch schema validates a canvas document", (t) => {
  const valid = validate(toCouch(testCanvas));
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
