import { router as trpcRouter, TRPCError } from "@trpc/server";

import { LapinContext } from "./context.js";

import { accessObjectRouter } from "./routes/accessObject.js";
import { collectionRouter } from "./routes/collection.js";
import { manifestRouter } from "./routes/manifest.js";
import { slugRouter } from "./routes/slug.js";

export function httpErrorToTRPC(error: { status: number; message: string }) {
  // theoretically this is being sorted upstream
  const code =
    error.status === 400
      ? "BAD_REQUEST"
      : error.status === 401
      ? "UNAUTHORIZED"
      : error.status === 404
      ? "PATH_NOT_FOUND"
      : "INTERNAL_SERVER_ERROR";
  return new TRPCError({ message: error.message, code });
}

export function createRouter() {
  return trpcRouter<LapinContext>();
}

export const router = createRouter()
  .merge("slug.", slugRouter)
  .merge("accessObject.", accessObjectRouter)
  .merge("manifest.", manifestRouter)
  .merge("collection.", collectionRouter);

export type LapinRouter = typeof router;
