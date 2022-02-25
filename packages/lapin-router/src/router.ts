import { router as trpcRouter, TRPCError } from "@trpc/server";

import { LapinContext } from "./context.js";

import { accessObjectRouter } from "./routes/accessObject.js";
import { collectionRouter } from "./routes/collection.js";
import { manifestRouter } from "./routes/manifest.js";
import { pdfRouter } from "./routes/pdf.js";
import { slugRouter } from "./routes/slug.js";
import { dmdTaskRouter } from "./routes/dmdTask.js";
import { dipstagingRouter } from "./routes/dipstaging.js";
import { ocrRouter } from "./routes/ocr.js";

export interface HTTPErrorLike {
  status: number;
  message: string;
}

const isErrorLike = (error: unknown): error is HTTPErrorLike => {
  return (
    typeof error === "object" &&
    error !== null &&
    error.hasOwnProperty("status") &&
    error.hasOwnProperty("message")
  );
};

/**
 * Converts an HTTP Error (i.e. one with `status` as its 3-digit code) to
 * the JSON-RPC format tRPC prefers. It looks like tRPC 9.x might accept
 * HTTP codes for errors, thankfully.
 */
export function httpErrorToTRPC(error: unknown) {
  if (isErrorLike(error)) {
    const code =
      error.status === 400
        ? "BAD_REQUEST"
        : error.status === 401
        ? "UNAUTHORIZED"
        : error.status === 404
        ? "PATH_NOT_FOUND"
        : "INTERNAL_SERVER_ERROR";
    return new TRPCError({ message: error.message, code });
  } else {
    return new TRPCError({
      message: "Unknown error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

export function createRouter() {
  return trpcRouter<LapinContext>();
}

export const router = trpcRouter<LapinContext>()
  .merge("slug.", slugRouter)
  .merge("accessObject.", accessObjectRouter)
  .merge("manifest.", manifestRouter)
  .merge("collection.", collectionRouter)
  .merge("pdf.", pdfRouter)
  .merge("dmdTask.", dmdTaskRouter)
  .merge("dipstaging.", dipstagingRouter)
  .merge("ocr.", ocrRouter);

export type LapinRouter = typeof router;
