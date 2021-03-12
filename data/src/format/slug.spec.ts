import test from "ava";
import { tester } from "../common.spec";

import { validate } from "./slug";

const { isValid } = tester(validate);

test("Slug schema validates a slug", isValid, "oocihm.00001");
