import { initializeCouchDB } from "./context/couchdb.js";
import { initializeNoid } from "./context/noid.js";
import { initializeRouteLimiter } from "./context/routeLimiter.js";
import { initializeSwift } from "./context/swift.js";
import { initializeSwiftClient } from "./context/swiftClient.js";

export type LapinContext = {
  couch: ReturnType<typeof initializeCouchDB>;
  noid: ReturnType<typeof initializeNoid>;
  swift: ReturnType<typeof initializeSwift>;
  swiftClient: ReturnType<typeof initializeSwiftClient>;
  routeLimiter: ReturnType<typeof initializeRouteLimiter>;
};

export function createContext(): LapinContext {
  return {
    couch: initializeCouchDB(),
    noid: initializeNoid(),
    swift: initializeSwift(),
    swiftClient: initializeSwiftClient(),
    routeLimiter: initializeRouteLimiter(),
  };
}
