import test from "ava";
import { tester } from "../testHelper.js";
import { Timestamp, parseTimestamp } from "./Timestamp.js";

const { isInvalid, isValid } = tester(Timestamp);

test(
  "Timestamp validates an ISO 8601 string in UTC with no second fractions",
  isValid,
  "2020-09-17T06:01:50Z"
);

test(
  "Timestamp invalidates an ISO 8601 string in UTC with second fractions",
  isInvalid,
  "2020-09-17T06:01:50.123Z"
);

test(
  "Timestamp invalidates an ISO 8601 string not in UTC",
  isInvalid,
  "2020-09-17T06:01:50-3:30"
);

test("Timestamp validates a number of seconds", isValid, 1616188726.633);

test("Can parse a timestamp", (t) => {
  t.is(parseTimestamp("2020-09-17T06:01:50Z").getFullYear(), 2020);
  t.is(parseTimestamp(1616188726.633).getFullYear(), 2021);
});
