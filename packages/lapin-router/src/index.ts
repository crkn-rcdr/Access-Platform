import { router } from "./router.js";
import { createContext } from "./context.js";

export type { LapinContext } from "./context.js";
export type { LapinRouter } from "./router.js";

export const createOptions = { router, createContext };
