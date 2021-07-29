import { initializeCouchDB } from "./context/couchdb.js";
import { initializeNoid } from "./context/noid.js";

export type LapinContext = {
  couch: ReturnType<typeof initializeCouchDB>;
  noid: ReturnType<typeof initializeNoid>;
};

export function createContext(): LapinContext {
  return {
    couch: initializeCouchDB(),
    noid: initializeNoid(),
  };
}
