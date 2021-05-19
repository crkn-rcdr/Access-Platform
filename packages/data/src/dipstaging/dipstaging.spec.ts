import test from "ava";
import { tester } from "../common.spec";

import { toCouch } from "../couch/util";
import { validate } from "./dipstaging";

const { isValid } = tester(validate);
