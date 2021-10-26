import { LapinRouter, router } from "./router.js";
import { createContext } from "./context.js";
import { CreateHttpHandlerOptions } from "@trpc/server";

export type { LapinContext } from "./context.js";
export type { LapinRouter } from "./router.js";

export const createOptions: CreateHttpHandlerOptions<LapinRouter> = {
  router,
  createContext,
  onError: ({ error, path, type }) => {
    console.error(
      `${new Date().toISOString()} -- Error: ${path} (${type}): ${
        error.code
      }\n`,
      error.message
    );
  },
};
