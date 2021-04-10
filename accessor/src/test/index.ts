import anyTest, { TestInterface } from "ava";
import { join as pathJoin } from "path";
import { getInstance, Instance, DatabaseHandler } from "kivik";

export type TestContext = {
  instance: Instance;
  handler: DatabaseHandler;
};

export const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.instance = await getInstance(
    pathJoin(__dirname, "..", "..", "..", "couchdb")
  );
});
