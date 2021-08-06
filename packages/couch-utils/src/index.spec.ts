import anyTest, { TestInterface } from "ava";
import { createKivik, DatabaseHandler } from "kivik";
import { ServerScope } from "nano";
import pRetry from "p-retry";
import { AccessHandler } from "./handlers/access.js";
import { client } from "./index.js";

type DatabaseName = "access" | "canvas" | "dipstaging" | "dmdtask";

export type BaseContext = {
  client: ServerScope;
  testDeploy<D>(db: DatabaseName, suffix: string): Promise<DatabaseHandler<D>>;
  testDestroy(db: DatabaseName, suffix: string): Promise<void>;
};

type IndexContext = BaseContext & { access: AccessHandler };

export const getTestContext = async (): Promise<BaseContext> => {
  const kivik = await createKivik(".");
  const c = client();

  // make sure couch responds
  await pRetry(async () => await c.db.get("access"), { retries: 50 });

  const testDeploy = kivik.testDeployer(c);
  const testDestroy = async (db: string, suffix: string) => {
    await c.db.destroy(`${db}-${suffix}`);
  };

  return { client: c, testDeploy, testDestroy };
};

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

test.after(async (t) => {
  await t.context.testDestroy("access", "index");
});
