import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./noid";

const { isValid, isInvalid } = tester(validate);

test("Noid schema validates an ARKful Noid", isValid, "69429/g02n4zg6h671");

test("Noid schema invalidates an ARKless Noid", isInvalid, "m02n4zg6h671");

test("Noid schema invalidates some random junk", isInvalid, "oocihm.something");

test(
  "Noid schema invalidates a noid with a weird first letter",
  isInvalid,
  "69429/a02n4zg6h671"
);
