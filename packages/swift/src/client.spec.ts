import anyTest, { TestInterface } from "ava";

import { BaseContext, getContext } from "./common.spec.js";

export type ClientContext = BaseContext;

const test = anyTest as TestInterface<ClientContext>;

test.before((t) => {
  t.context = getContext();
});

test("info() returns", async (t) => {
  const info = await t.context.client.info();
  t.is(typeof info, "object");
  t.is(
    typeof (info?.["swift"] as Record<string, unknown>)["version"],
    "string"
  );
});
