import test from "ava";
import { tester } from "../common.spec";

import { StaffUpdate, validate } from "./StaffUpdate";

const { isValid, isInvalid } = tester(validate);

const VALID_NAME = "Brittny Lapierre";
const INVALID_NAME = "";

const VALID_EMAIL = "blapierre@crkn.ca";
const INVALID_EMAIL = "";

const VALID_DATE = "2021-01-14T16:30:02Z";
const INVALID_DATE = "";


test(
    "StaffUpdate invalidates an empty name",
    isInvalid,
    {
        by: {
            name: INVALID_NAME,
            email: VALID_EMAIL
        },
        date: VALID_DATE
    }
);

test(
    "StaffUpdate invalidates an empty email",
    isInvalid,
    {
        by: {
            name: VALID_NAME,
            email: INVALID_EMAIL
        },
        date: VALID_DATE
    }
);

test(
    "StaffUpdate invalidates an empty date",
    isInvalid,
    {
        by: {
            name: VALID_NAME,
            email: VALID_EMAIL
        },
        date: INVALID_DATE
    }
);

test(
    "StaffUpdate invalidates a null by",
    isInvalid,
    {
        date: INVALID_DATE
    }
);

test(
    "StaffUpdate invalidates a null date",
    isInvalid,
    {
        by: {
            name: VALID_NAME,
            email: VALID_EMAIL
        }
    }
);

test(
    "StaffUpdate validates an correct by and date",
    isValid,
    {
        by: {
            name: VALID_NAME,
            email: VALID_EMAIL
        },
        date: VALID_DATE
    }
);