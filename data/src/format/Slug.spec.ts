import test from "ava";

import { validate } from "./Slug";

test("Slug schema validates a slug", (t) => {
  t.is(validate("oocihm.00001"), true);
});
