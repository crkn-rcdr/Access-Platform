import { test } from "./test";
import { Accessor } from ".";

const accessor = new Accessor("http://localhost:5984", {
  user: "kivik",
  password: "kivik",
});

test("Has slug interface", async (t) => {
  t.is(typeof accessor.slug, "object");
});
