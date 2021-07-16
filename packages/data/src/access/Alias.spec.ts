import test from "ava";
import { tester } from "../testHelper.js";
import { Alias } from "./Alias.js";

const { isValid } = tester(Alias);

export const testAlias: Alias = {
  id: "69429/m02n4zg6h671",
  type: "alias",
  slug: "typoOfSorts",
  to: "not.a.typo",
};

test("Alias schema validates an Alias", isValid, testAlias);
