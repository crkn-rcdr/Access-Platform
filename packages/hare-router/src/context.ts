import { initializeCouchDB } from "./context/couchdb.js";
import { initializeNoid } from "./context/noid.js";
import { initializeRouteLimiter } from "./context/routeLimiter.js";
import { initializeSwift } from "./context/swift.js";

export type HareContext = {
  couch: ReturnType<typeof initializeCouchDB>;
  noid: ReturnType<typeof initializeNoid>;
  swift: ReturnType<typeof initializeSwift>;
  routeLimiter: ReturnType<typeof initializeRouteLimiter>;
};

export function createContext(): HareContext {
  return {
    couch: initializeCouchDB(),
    noid: initializeNoid(),
    swift: initializeSwift(),
    routeLimiter: initializeRouteLimiter(),
  };
}
