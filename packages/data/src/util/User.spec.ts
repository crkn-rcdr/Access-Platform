import test from "ava";
import { tester } from "../common.spec";

import { User, validate } from "./User";

const { isValid, isInvalid } = tester(validate);

// check name is valid string

// check email is valid string

// check email matches pattern
