import test from "ava";
import { tester } from "../common.spec";

import { StaffUpdate, validate } from "./StaffUpdate";

const { isValid, isInvalid } = tester(validate);

// check by is valid

// check date is valid
