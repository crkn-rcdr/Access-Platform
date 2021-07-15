import test from "ava";
import { tester } from "../common.spec";
import { Mets, validate } from "./Mets";
const { isValid, isInvalid } = tester(validate);

const VALID_PATH = "oocihm.8_00006_5/data/sip/data/files/7753.pdf";
const INVALID_PATH = "";

const VALID_MD5 = "48f2c808224824705562a8891f90978e";
const INVALID_MD5 = "";

test(
    "Mets invalidates an empty path",
    isInvalid,
    {
        path: INVALID_PATH,
        md5: VALID_MD5
    }
);

test(
    "Mets invalidates an empty md5",
    isInvalid,
    {
        path: VALID_PATH,
        md5: INVALID_MD5
    }
);


test(
    "Mets validates a correct path and correct md5",
    isValid,
    {
        path: VALID_PATH,
        md5: VALID_MD5
    }
);