import { test } from "./test";
import { Accessor } from ".";

const accessor = new Accessor({
  couch: {
    url: "http://127.0.0.1:5984",
    auth: {
      user: "kivik",
      password: "kivik",
    },
  },
});

test("Has slug interface", async (t) => {
  t.is(typeof accessor.slug, "object");
});
