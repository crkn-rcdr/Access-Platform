import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./timestamp";

const { isValid, isInvalid } = tester(validate);

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
