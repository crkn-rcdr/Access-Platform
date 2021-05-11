import { test } from "./test";
import { Accessor } from ".";

const accessor = new Accessor({
  couch: {
    url: "http://localhost:5984",
    auth: {
      user: "kivik",
      password: "kivik",
    },
  },
});

test("Has slug interface", async (t) => {
  t.is(typeof accessor.slug, "object");
});
