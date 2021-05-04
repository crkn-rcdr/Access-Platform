import { test } from "./test";

import { getHandlers } from "./databases";

test("Can get handlers", async (t) => {
  const handlers = getHandlers("http://localhost:5984", {});
  t.is(typeof handlers.access, "object");
});
