import anyTest, { TestInterface } from "ava";

import { BaseContext, getContext, randomName } from "./common.spec.js";

export type ClientContext = BaseContext;

const test = anyTest as TestInterface<ClientContext>;

test.before((t) => {
  t.context = getContext();
});

test("can recieve Swift capabilities", async (t) => {
  const info = await t.context.client.info();
  t.is(typeof info, "object");
  t.is(
    typeof (info?.["swift"] as Record<string, unknown>)["version"],
    "string"
  );
});

test("can post and receive account metadata", async (t) => {
  const custom = "hey there";
  await t.context.client.postMetadata({ custom });

  const response = await t.context.client.getMetadata();
  t.true(response.date < new Date(), "Dates are converted to `Date`s");
  t.is(typeof response.transactionId, "string", "Transaction IDs are sent");
  t.is(response.metaHeader("custom"), custom, "Custom metadata is passed");
  t.not(response.header("container-count"), null, "Expected headers are found");
});

test("Can list containers", async (t) => {
  const list = await t.context.client.listContainers();
  t.true(Array.isArray(list.content), "Container list is an array");
});

test("can create and delete containers", async (t) => {
  const name = randomName();
  await t.context.client.createContainer(name);

  let list = (await t.context.client.listContainers()).content;
  t.truthy(list.find((listing) => listing.name === name));

  await t.context.client.deleteContainer(name);

  list = (await t.context.client.listContainers()).content;
  t.falsy(list.find((listing) => listing.name === name));
});
