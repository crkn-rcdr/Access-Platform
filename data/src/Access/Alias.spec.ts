import test from "ava";
import Validator from "../Validator";

import { Alias, schema } from "./Alias";

const validate = new Validator().compile(schema);

const alias: Alias = {
  id: "69429/m02n4zg6h671",
  type: "alias",
  slug: "typoOfSorts",
  to: "69429/m0696zw19t6s",
};

test("Alias schema validates an Alias", (t) => {
  const valid = validate(alias);
  t.is(valid, true);
  if (!valid) console.log(validate.errors);
});
