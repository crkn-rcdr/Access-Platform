import { test } from "../test";

import { initializeCouchDB } from "./CouchDB";

test("Can initialize endpoint with DB handlers", async (t) => {
  const handlers = initializeCouchDB({
    url: "http://localhost:5984",
    auth: { user: "fake", password: "fake" },
  });
  t.is(typeof handlers.access, "object");
});
