import test from "ava";
import { tester } from "../common.spec";
import { User, validate } from "./User";
const { isValid, isInvalid } = tester(validate);

const VALID_NAME = "Brittny Lapierre";
const INVALID_NAME = "";

const VALID_EMAIL = "blapierre@crkn.ca";
const INVALID_EMAIL = "";

test(
    "User invalidates an empty name",
    isInvalid,
    {
        name: INVALID_NAME,
        email: VALID_EMAIL
    }
);

test(
    "User invalidates an empty email",
    isInvalid,
    {
        name: VALID_NAME,
        email: INVALID_EMAIL
    }
);


test(
    "User validates a correct name and correct email",
    isValid,
    {
        name: VALID_NAME,
        email: VALID_EMAIL
    }
);