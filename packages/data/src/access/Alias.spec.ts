import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./Alias";
import { isAlias } from ".";
import { testAlias, testGuard } from "./common.spec";

const { isValid } = tester(validate);

test("Alias schema validates an Alias", isValid, testAlias);

test(
  "isAlias discerns aliases from other objects",
  testGuard,
  isAlias,
  "alias"
);
