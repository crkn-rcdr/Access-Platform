import test from "ava";
import { tester } from "../common.spec";

import { ProcessUpdate, validate } from "./ProcessUpdate";

const { isValid } = tester(validate);

const minimal: ProcessUpdate = {
  requestDate: "2020-02-02T02:02:02Z",
};

const maximal: ProcessUpdate = {
  requestDate: "2020-02-02T02:02:02Z",
  processDate: "2020-02-03T02:02:02Z",
  succeeded: false,
  message: "Something went wrong.",
};

test(
  "ProcessUpdate schema validates a minimal ProcessUpdate",
  isValid,
  minimal
);

test(
  "ProcessUpdate schema validates a maximal ProcessUpdate",
  isValid,
  maximal
);
