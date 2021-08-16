import anyTest, { TestInterface } from "ava";

import { BaseContext, getContext } from "./common.spec.js";

const test = anyTest as TestInterface<BaseContext>;

test.before((t) => {
  t.context = getContext();
});

test("can post and receive account metadata", async (t) => {
  const custom = "hey there";
  await t.context.account.post({ custom });

  const response = await t.context.account.head();
  t.true(response.date < new Date(), "Dates are converted to `Date`s");
  t.is(typeof response.transactionId, "string", "Transaction IDs are sent");
  t.is(response.metaHeader("custom"), custom, "Custom metadata is passed");
  t.not(response.header("container-count"), null, "Expected headers are found");
});

test("account.get() returns a list", async (t) => {
  const list = await t.context.account.get();
  t.true(Array.isArray(list.content), "Container list is an array");
});
