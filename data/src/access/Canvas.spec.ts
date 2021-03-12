import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./Canvas";
import { testCanvas } from "./common.spec";

const { isValid } = tester(validate);

test("Canvas schema validates a Canvas", isValid, testCanvas);
