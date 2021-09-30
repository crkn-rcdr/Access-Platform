import { router as trpcRouter, TRPCError } from "@trpc/server";

import { LapinContext } from "./context.js";

import { accessObjectRouter } from "./routes/accessObject.js";
import { collectionRouter } from "./routes/collection.js";
import { manifestRouter } from "./routes/manifest.js";
import { slugRouter } from "./routes/slug.js";
import { dmdTaskRouter } from "./routes/dmdTask.js";
import { wipmetaRouter } from "./routes/wipmeta.js";
import { dipstagingRouter } from "./routes/dipstaging.js";

export interface HTTPErrorLike {
  status: number;
  message: string;
}

/**
 * Converts an HTTP Error (i.e. one with `status` as its 3-digit code) to
 * the JSON-RPC format tRPC prefers. It looks like tRPC 9.x might accept
 * HTTP codes for errors, thankfully.
 */
export function httpErrorToTRPC(error: HTTPErrorLike) {
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
  .merge("collection.", collectionRouter)
  .merge("dmdTask.", dmdTaskRouter)
  .merge("dipstaging.", dipstagingRouter)
  .merge("wipmeta.", wipmetaRouter);

export type LapinRouter = typeof router;
