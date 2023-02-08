import { createKivik, DatabaseHandler } from "kivik";
import { ServerScope } from "nano";
import pRetry from "p-retry";
import { client } from "./index.js";

type DatabaseName =
  | "access"
  | "canvas"
  | "dipstaging"
  | "dmdtask"
  | "wipmeta"
  | "ocr";

export type BaseContext = {
  client: ServerScope;
  testDeploy<D>(db: DatabaseName, suffix: string): Promise<DatabaseHandler<D>>;
  testDestroy(db: DatabaseName, suffix: string): Promise<void>;
};

export const getTestContext = async (): Promise<BaseContext> => {
  const kivik = await createKivik(".");
  const c = client();

  // make sure couch responds
  await pRetry(async () => await c.db.get("access"), { });

  const testDeploy = kivik.testDeployer(c);
  const testDestroy = async (db: string, suffix: string) => {
    await c.db.destroy(`${db}-${suffix}`);
  };

  return { client: c, testDeploy, testDestroy };
};
