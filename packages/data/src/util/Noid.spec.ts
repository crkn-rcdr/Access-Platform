import test from "ava";
import { tester } from "../testHelper.js";
import { Noid } from "./Noid.js";

const { isValid, isInvalid } = tester(Noid);

test("Noid regex validates an ARKful Noid", isValid, "69429/g02n4zg6h671");

test("Noid regex invalidates an ARKless Noid", isInvalid, "m02n4zg6h671");

test("Noid regex invalidates some random junk", isInvalid, "oocihm.something");

test(
  "Noid regex invalidates a noid with a weird first letter",
  isInvalid,
  "69429/a02n4zg6h671"
);
