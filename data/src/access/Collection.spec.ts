import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./Collection";
import { testCollection } from "./common.spec";

const { isValid } = tester(validate);

test("Collection schema validates a Collection", isValid, testCollection);
