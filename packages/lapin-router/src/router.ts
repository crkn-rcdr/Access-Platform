import { router as trpcRouter } from "@trpc/server";

import { LapinContext } from "./context.js";

import { slugRouter } from "./routes/slug.js";
import { noidRouter } from "./routes/noid.js";

export function createRouter() {
  return trpcRouter<LapinContext>();
}

export const router = createRouter()
  .merge("slug.", slugRouter)
  .merge("noid.", noidRouter);

export type LapinRouter = typeof router;
