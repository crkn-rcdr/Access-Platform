import { createKivik, DatabaseHandler } from "kivik";
//What should be the serverScope? 
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
  testDeploy<D>(route: LapinRoutes, suffix: string): Promise<LapinContext<D>>;// Lapincontext is not a generic type, but then the LapiContext is what to be tested right?
  testDestroy(route: LapinRoutes, suffix: string): Promise<void>;
};

export const getTestContext = async (): Promise<BaseContext> => {
  const kivik = await createKivik(".");
  const c = client();

  await pRetry(async () => await c.session.bind("http://172.30.0.51:5858"), {
    retries: 50,
  });

  const testDeploy = kivik.testDeployer(c);
    const testDestroy = async (route: string, suffix: string) => {
      await c.route.destroy(`${route}-${suffix}`);
  };
  return { client: c, testDeploy, testDestroy };
};
