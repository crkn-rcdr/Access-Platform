import anyTest, { TestInterface } from "ava";
import { join as pathJoin } from "path";
import { DatabaseHandler, getInstance } from "kivik";
import { DatabaseName } from "../endpoints/CouchDB";
import { DocumentTypes } from "@crkn-rcdr/access-data";

export { TestInterface } from "ava";

export interface TestContext {
  deployDb<T extends DatabaseName>(
    db: T,
    suffix: string
  ): Promise<DatabaseHandler<DocumentTypes[T]>>;
}

export const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  const instance = await getInstance(
    pathJoin(__dirname, "..", "..", "..", "..", "services", "couchdb")
  );

  t.context.deployDb = async (db, suffix) => {
    return await instance.deployDb(db, suffix);
  };
});
