import test from "ava";
import { Validator } from "../Validator";

import { schema } from "./Slug";

const validate = new Validator().compile(schema);

test("Slug schema validates a slug", (t) => {
  t.is(validate("oocihm.00001"), true);
});
