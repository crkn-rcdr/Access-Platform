import anyTest, { TestInterface } from "ava";
import { AccessHandler } from "./handlers/access.js";
import { BaseContext, getTestContext } from "./test.js";

type IndexContext = BaseContext & { access: AccessHandler };

const test = anyTest as TestInterface<IndexContext>;

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    access: new AccessHandler(baseContext.client, "index"),
  };
  await t.context.testDeploy("access", "index");
});

test("Tests can interact with CouchDB", async (t) => {
  const getObject = async () =>
    await t.context.access.get("69429/m02n4zg6h671");

  await t.notThrowsAsync(getObject);
});

test.after.always(async (t) => {
  await t.context.testDestroy("access", "index");
});
