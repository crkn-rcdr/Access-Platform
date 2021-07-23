import { router as trpcRouter } from "@trpc/server";

import { LapinContext } from "./context.js";

import { slugRouter } from "./routes/slug.js";
import { noidRouter } from "./routes/noid.js";
import { objectRouter } from "./routes/object.js";

export function createRouter() {
  return trpcRouter<LapinContext>();
}

export const router = createRouter()
  .merge("slug.", slugRouter)
  .merge("noid.", noidRouter)
  .merge("object.", objectRouter);

export type LapinRouter = typeof router;
