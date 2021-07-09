import * as trpc from "@trpc/server";

import { Context } from "./context.js";

import { slugRouter } from "./routes/slug.js";

export function createRouter() {
  return trpc.router<Context>();
}

export const lapin = createRouter().merge("slug.", slugRouter);

export type LapinRouter = typeof lapin;
