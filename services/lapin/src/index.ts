import * as trpc from "@trpc/server";
import { lapin } from "./router.js";
import { createContext } from "./context.js";

export type { LapinRouter } from "./router.js";

const { listen } = trpc.createHttpServer({
  router: lapin,
  createContext,
});

listen(5858);
