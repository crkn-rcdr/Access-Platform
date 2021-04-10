import anyTest, { TestInterface } from "ava";
import { join as pathJoin } from "path";
import { getInstance, Instance } from "kivik";
import { DatabaseHandlers } from "../databases";

export type TestContext = DatabaseHandlers & {
  instance: Instance;
};

export const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.instance = await getInstance(
    pathJoin(__dirname, "..", "..", "..", "couchdb")
  );
});
