import test from "ava";
import { tester } from "../../testHelper.js";
import { TextRecord } from "./TextRecord.js";

const { isValid, isInvalid } = tester(TextRecord);

test("TextRecord validates a well-formed object", isValid, {
  en: "Monographs",
  "fr-ca": "Monographies",
});

test("TextRecord invalidates a poorly-formed object", isInvalid, {
  en: "Monographs",
  fr: "Monographies",
  "what???": "huh??",
});

test("TextRecord invalidates an empty object", isInvalid, {});
