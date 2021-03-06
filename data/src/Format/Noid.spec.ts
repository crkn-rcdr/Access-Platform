import test from "ava";
import Validator from "../Validator";

import { format } from "./Noid";

const validate = new Validator().compile(format.schema);

test("Noid schema validates an ARKful Noid", (t) => {
  t.is(validate("69429/m02n4zg6h671"), true);
});

test("Noid schema invalidates an ARKless Noid", (t) => {
  t.is(validate("m02n4zg6h671"), false);
});

test("Noid schema invalidates some random junk", (t) => {
  t.is(validate("oocihm.something"), false);
});
