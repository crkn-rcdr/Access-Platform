import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./Collection";
import { isCollection } from ".";
import { testCollection, testGuard } from "./common.spec";

const { isValid } = tester(validate);

test("Collection schema validates a Collection", isValid, testCollection);

test(
  "isCollection discerns Collections from other objects",
  testGuard,
  isCollection,
  "collection"
);
