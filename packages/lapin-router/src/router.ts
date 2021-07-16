import { router as trpcRouter } from "@trpc/server";

import { LapinContext } from "./context.js";

import { slugRouter } from "./routes/slug.js";

export function createRouter() {
  return trpcRouter<LapinContext>();
}

export const router = createRouter().merge("slug.", slugRouter);

export type LapinRouter = typeof router;
