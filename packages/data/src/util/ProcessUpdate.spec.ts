import test from "ava";
import { tester } from "../testHelper.js";
import { ProcessUpdate } from "./ProcessUpdate.js";

const { isValid, isInvalid } = tester(ProcessUpdate);

const minimal = {
  requestDate: "2020-02-02T02:02:02Z",
};

const maximal = {
  requestDate: "2020-02-02T02:02:02Z",
  processDate: "2020-02-03T02:02:02Z",
  succeeded: false,
  message: "Something went wrong.",
};

const bogus = {
  requestDate: "2020-02-02T02:02:02Z",
  processDate: "2020-02-03T02:02:02Z",
  bogus: true,
};

test("ProcessUpdate validates a ProcessUpdate request", isValid, minimal);

test("ProcessUpdate validates a ProcessUpdate result", isValid, maximal);

test("ProcessUpdate invalidates a bogus ProcessUpdate", isInvalid, bogus);
