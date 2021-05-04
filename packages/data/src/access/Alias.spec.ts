import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./Alias";
import { testAlias } from "./common.spec";

const { isValid } = tester(validate);

test("Alias schema validates an Alias", isValid, testAlias);
