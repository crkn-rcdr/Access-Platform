import { test } from "./test";

test.beforeEach(async (t) => {
  t.context.handler = await t.context.instance.deployDb("access", "index");
});

test("Can deploy", async (t) => {
  const list = await t.context.handler.list();
  t.truthy(list.rows.find((row) => row.id === "69429/m02n4zg6h671"));
});
