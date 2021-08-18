import { initializeCouchDB } from "./context/couchdb.js";
import { initializeNoid } from "./context/noid.js";
import { initializeSwift } from "./context/swift.js";

export type LapinContext = {
  couch: ReturnType<typeof initializeCouchDB>;
  noid: ReturnType<typeof initializeNoid>;
  swift: ReturnType<typeof initializeSwift>;
};

export function createContext(): LapinContext {
  return {
    couch: initializeCouchDB(),
    noid: initializeNoid(),
    swift: initializeSwift(),
  };
}
