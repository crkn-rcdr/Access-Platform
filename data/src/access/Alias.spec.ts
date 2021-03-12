import test from "ava";

import { Alias, validate } from "./Alias";

export const testAlias: Alias = {
  id: "69429/m02n4zg6h671",
  type: "alias",
  slug: "typoOfSorts",
  to: "69429/m0696zw19t6s",
};

test("Alias schema validates an Alias", (t) => {
  const valid = validate(testAlias);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
