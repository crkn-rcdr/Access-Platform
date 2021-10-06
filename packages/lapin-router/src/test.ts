import { createKivik, DatabaseHandler } from "kivik";
import { ServerScope } from "nano";
import { createOptions } from "./index.js";
import pRetry from "p-retry";
import { LapinRouter } from "./router.js";
import { LapinContext } from "./context.js";
import { client } from "@crkn-rcdr/couch-utils";
type LapinRoutes = "http://172.30.0.51:5858";
// Should I use Kivik and DB here
export type BaseContext = {
  client: ServerScope;
  testDeploy<D>(route: LapinRoutes, suffix: string): Promise<LapinContext<D>>;
  testDestroy(route: LapinRoutes, suffix: string): Promise<void>;
};

export const getTestContext = async (): Promise<BaseContext> => {
  const kivik = await createKivik(".");
  const c = client();

  await pRetry(async () => await c.session.bind("http://172.30.0.51:5858"), {
    retries: 50,
  });

  const testDeploy = kivik.testDeployer(c);
  const testDestroy = async (route: string, suffix: string) => {};
  return { client: c, testDeploy, testDestroy };
};
