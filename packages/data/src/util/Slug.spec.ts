import test from "ava";
import { tester } from "../testHelper.js";
import { Slug } from "./Slug.js";

const { isInvalid, isValid } = tester(Slug);

test("Slug regex validates something familiar", isValid, "oocihm.00001");

test("Slug regex invalidates an ARKful Noid", isInvalid, "69429/g02n4zg6h671");
