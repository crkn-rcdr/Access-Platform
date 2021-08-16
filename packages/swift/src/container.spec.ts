import anyTest, { TestInterface } from "ava";

import { BaseContext, getContext } from "./common.spec.js";

const test = anyTest as TestInterface<BaseContext>;

test.before((t) => {
  t.context = getContext();
});

const getName = () => `cont-${Math.random()}`;

test("can create and delete containers", async (t) => {
  const name = getName();
  const container = t.context.account.container(name);
  await container.put();

  let list = (await t.context.account.get()).content;
  t.truthy(list.find((listing) => listing.name === name));

  await container.delete();

  list = (await t.context.account.get()).content;
  t.falsy(list.find((listing) => listing.name === name));
});

test("can post and receive container metadata", async (t) => {
  const foo = "hey there";
  const bar = "how's it going";

  const name = getName();
  const container = t.context.account.container(name);

  await container.put({ foo });
  let response = await container.head();
  t.is(response.metaHeader("foo"), foo);

  await container.post({ bar });
  response = await container.head();
  t.is(response.metaHeader("bar"), bar);

  await container.delete();
});
