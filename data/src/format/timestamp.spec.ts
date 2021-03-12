import test from "ava";

import { validate } from "./timestamp";

test("Timestamp validates an ISO 8601 string in UTC with no second fractions", (t) => {
  t.is(validate("2020-09-17T06:01:50Z"), true);
});

test("Timestamp invalidates an ISO 8601 string in UTC with second fractions", (t) => {
  t.is(validate("2020-09-17T06:01:50.123Z"), false);
});

test("Timestamp invalidates an ISO 8601 string not in UTC", (t) => {
  t.is(validate("2020-09-17T06:01:50-3:30"), false);
});
