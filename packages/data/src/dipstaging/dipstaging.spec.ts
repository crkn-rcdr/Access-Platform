import test from "ava";
import { tester } from "../common.spec";

import { toCouch } from "../couch/util";
import { validate } from ".";

const { isValid } = tester(validate);
