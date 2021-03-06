import test from "ava";
import Validator from "../Validator";

import ProcessUpdate, { schema } from "./ProcessUpdate";

const validate = new Validator().compile(schema);

const minimal: ProcessUpdate = {
  requestDate: "2020-02-02T02:02:02Z",
};

const maximal: ProcessUpdate = {
  requestDate: "2020-02-02T02:02:02Z",
  processDate: "2020-02-03T02:02:02Z",
  succeeded: false,
  message: "Something went wrong.",
};

test("ProcessUpdate schema validates a minimal ProcessUpdate", (t) => {
  t.is(validate(minimal), true);
});

test("ProcessUpdate schema validates a maximal ProcessUpdate", (t) => {
  t.is(validate(maximal), true);
});
