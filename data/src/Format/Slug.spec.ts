import test from "ava";
import Validator from "../Validator";

import { format } from "./Slug";

const validate = new Validator().compile(format.schema);

test("Slug schema validates a slug", (t) => {
  t.is(validate("oocihm.00001"), true);
});
